import { useEffect, useState } from 'react';
import { Modal as RNModal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Button, Chip, IconButton, SegmentedControl } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppImage } from '@/components/shared/AppImage';
import { AppModal } from '@/components/ui/Modal';
import { formatNGN } from '@/utils/money';
import {
  useGetSalesTerminalProductsQuery,
  useGetSalesTerminalCategoriesQuery,
  useGetBarcodeProductQuery,
} from '@/api/productApi';
import { useRecordVendorOfflineSaleMutation } from '@/api/orderApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  addSaleItem,
  updateSaleQuantity,
  removeSaleItem,
  setSalePaymentMethod,
  setSaleCustomer,
  setSaleNotes,
  clearSaleCart,
  selectSaleCart,
} from '@/features/saleCartSlice';
import type { ISalesTerminalProduct } from '@/types/product';
import type { IProductVariant } from '@/types/product';
import type { SalePaymentMethod } from '@/features/saleCartSlice';

export default function PosScreen() {
  const { colors, spacing } = useAppTheme();
  const toast = useToast();
  const dispatch = useAppDispatch();

  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');

  const { data: productsData, isLoading } = useGetSalesTerminalProductsQuery({
    page,
    limit: 50,
    search: search || undefined,
  });
  const { data: categories } = useGetSalesTerminalCategoriesQuery();

  const [variantProduct, setVariantProduct] = useState<ISalesTerminalProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<IProductVariant | null>(null);
  const [variantQuantity, setVariantQuantity] = useState(1);

  const saleCart = useAppSelector(selectSaleCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [receipt, setReceipt] = useState<{ order_id: string; total: number } | null>(null);

  const [recordSale, { isLoading: recording }] = useRecordVendorOfflineSaleMutation();

  const { data: barcodeResult, isFetching: barcodeFetching } = useGetBarcodeProductQuery(barcode, {
    skip: !barcode,
  });

  useEffect(() => {
    if (barcodeResult) {
      handleProductPick({
        id: barcodeResult.id,
        name: barcodeResult.name,
        slug: barcodeResult.slug,
        price: barcodeResult.discount_price ?? barcodeResult.price,
        image: barcodeResult.image,
        stock: barcodeResult.stock ?? 0,
        variants: barcodeResult.variants,
      });
      setBarcode('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barcodeResult]);

  const filteredProducts =
    categoryId === ''
      ? productsData?.items ?? []
      : (productsData?.items ?? []).filter(
          (product) => product.category?.id === categoryId,
        );

  const handleProductPick = (product: ISalesTerminalProduct) => {
    if (product.variants && product.variants.length > 0) {
      setVariantProduct(product);
      setSelectedVariant(null);
      setVariantQuantity(1);
      return;
    }
    dispatch(
      addSaleItem({
        product_id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
        quantity: 1,
      }),
    );
  };

  const confirmVariant = () => {
    if (!variantProduct) {
      return;
    }
    if (variantProduct.variants && variantProduct.variants.length > 0 && !selectedVariant) {
      toast.showError('Select a variant');
      return;
    }
    dispatch(
      addSaleItem({
        product_id: variantProduct.id,
        variant_id: selectedVariant?.id,
        name: variantProduct.name,
        slug: variantProduct.slug,
        price: selectedVariant?.discount_price ?? selectedVariant?.price ?? variantProduct.price,
        image: selectedVariant?.image_url ?? variantProduct.image,
        quantity: variantQuantity,
        variant_options: selectedVariant?.combinations,
      }),
    );
    setVariantProduct(null);
  };

  const handleCheckout = async () => {
    if (saleCart.items.length === 0) {
      toast.showError('Add items to the sale');
      return;
    }
    try {
      const result = await recordSale({
        items: saleCart.items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
        customer_name: saleCart.customerName,
        customer_email: saleCart.customerEmail,
        notes: saleCart.notes,
        payment_method: saleCart.paymentMethod,
      }).unwrap();
      setReceipt({ order_id: result.order_id ?? '', total: saleCart.total });
      setCartOpen(false);
      dispatch(clearSaleCart());
      toast.showSuccess('Sale recorded');
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Row
        style={{
          padding: spacing.md,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: spacing.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <SegmentedControl<SalePaymentMethod>
            value={saleCart.paymentMethod}
            onChange={(paymentMethod) => dispatch(setSalePaymentMethod(paymentMethod))}
            options={[
              { label: 'Cash', value: 'cash' },
              { label: 'Transfer', value: 'transfer' },
              { label: 'POS', value: 'pos' },
            ]}
          />
        </View>
        <IconButton
          accessibilityLabel="Scan barcode"
          icon={<Ionicons name="barcode-outline" size={22} color={colors.primary} />}
          onPress={() => setScannerOpen(true)}
        />
        <Pressable onPress={() => setCartOpen(true)}>
          <View
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
            }}
          >
            <Ionicons name="cart" size={18} color={colors.primaryForeground} />
            <AppText variant="label" weight="bold" color={colors.primaryForeground}>
              {saleCart.count}
            </AppText>
          </View>
        </Pressable>
      </Row>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <Row style={{ padding: spacing.md, gap: spacing.sm }}>
          <Chip label="All" selected={categoryId === ''} onPress={() => setCategoryId('')} />
          {(categories ?? []).map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              selected={categoryId === category.id}
              onPress={() => setCategoryId(category.id)}
            />
          ))}
        </Row>
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.md }}>
        {isLoading ? (
          <AppText color={colors.textMuted}>Loading products…</AppText>
        ) : filteredProducts.length === 0 ? (
          <AppText color={colors.textMuted} center style={{ paddingTop: spacing.xxl }}>
            No products found
          </AppText>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
            {filteredProducts.map((product) => (
              <Pressable
                key={product.id}
                onPress={() => handleProductPick(product)}
                style={({ pressed }) => [{ width: '47%', opacity: pressed ? 0.85 : 1 }]}
              >
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    overflow: 'hidden',
                    marginBottom: spacing.md,
                  }}
                >
                  <AppImage uri={product.image} style={{ width: '100%', height: 90 }} fallbackText={product.name} />
                  <View style={{ padding: spacing.sm, gap: 2 }}>
                    <AppText variant="small" weight="medium" numberOfLines={1}>
                      {product.name}
                    </AppText>
                    <AppText variant="small" weight="bold" color={colors.primary}>
                      {formatNGN(product.price)}
                    </AppText>
                    <AppText variant="small" color={product.stock > 0 ? colors.textSubtle : colors.danger}>
                      {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of stock'}
                    </AppText>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {saleCart.count > 0 ? (
        <Pressable onPress={() => setCartOpen(true)}>
          <View
            style={{
              padding: spacing.lg,
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View>
              <AppText variant="label" color={colors.textMuted}>
                {saleCart.count} item(s)
              </AppText>
              <AppText variant="title" weight="bold" color={colors.primary}>
                {formatNGN(saleCart.total)}
              </AppText>
            </View>
            <AppText variant="label" weight="semibold" color={colors.primary}>
              View Sale Cart ›
            </AppText>
          </View>
        </Pressable>
      ) : null}

      <AppModal
        visible={Boolean(variantProduct)}
        onClose={() => setVariantProduct(null)}
        title="Select Variant"
        footer={<Button title="Add to Sale" onPress={confirmVariant} />}
        scrollable
      >
        <View style={{ gap: spacing.md }}>
          {variantProduct?.variants?.map((variant) => {
            const isSelected = selectedVariant?.id === variant.id;
            const label = variant.combinations
              ? Object.entries(variant.combinations)
                  .map(([name, value]) => `${name}: ${value}`)
                  .join(' · ')
              : variant.id.slice(0, 8);
            return (
              <Button
                key={variant.id}
                title={`${label} · ${formatNGN(variant.discount_price ?? variant.price)}`}
                variant={isSelected ? 'primary' : 'outline'}
                onPress={() => setSelectedVariant(variant)}
                disabled={variant.stock <= 0}
              />
            );
          })}
          <Row style={{ gap: spacing.md, alignItems: 'center' }}>
            <AppText variant="label" color={colors.textMuted}>
              Quantity
            </AppText>
            <Row style={{ gap: spacing.sm }}>
              <IconButton
                accessibilityLabel="Decrease"
                icon={<AppText style={{ fontSize: 16 }}>−</AppText>}
                onPress={() => setVariantQuantity((q) => Math.max(1, q - 1))}
              />
              <AppText variant="label" weight="bold">
                {variantQuantity}
              </AppText>
              <IconButton
                accessibilityLabel="Increase"
                icon={<AppText style={{ fontSize: 16 }}>+</AppText>}
                onPress={() => setVariantQuantity((q) => q + 1)}
              />
            </Row>
          </Row>
        </View>
      </AppModal>

      <SaleCartModal
        visible={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
        recording={recording}
      />

      <BarcodeScannerModal
        visible={scannerOpen}
        fetching={barcodeFetching}
        onClose={() => {
          setScannerOpen(false);
          setBarcode('');
        }}
        onScan={(code) => {
          setBarcode(code);
          setScannerOpen(false);
        }}
      />

      <RNModal visible={Boolean(receipt)} transparent animationType="fade" onRequestClose={() => setReceipt(null)}>
        <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.lg }}>
          <Card style={{ alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: colors.primaryMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="checkmark" size={32} color={colors.primary} />
            </View>
            <AppText variant="title" weight="bold">
              Sale Complete
            </AppText>
            <AppText variant="label" color={colors.textMuted}>
              Order {receipt?.order_id.slice(0, 8)}
            </AppText>
            <AppText variant="subtitle" weight="bold" color={colors.primary}>
              {formatNGN(receipt?.total ?? 0)}
            </AppText>
            <Button title="Done" onPress={() => setReceipt(null)} />
          </Card>
        </View>
      </RNModal>
    </View>
  );
}

function SaleCartModal({
  visible,
  onClose,
  onCheckout,
  recording,
}: {
  visible: boolean;
  onClose: () => void;
  onCheckout: () => void;
  recording: boolean;
}) {
  const { colors, spacing } = useAppTheme();
  const dispatch = useAppDispatch();
  const saleCart = useAppSelector(selectSaleCart);
  const [customerName, setCustomerName] = useState('');

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Sale Cart"
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button title={`Complete Sale · ${formatNGN(saleCart.total)}`} onPress={onCheckout} loading={recording} />
        </View>
      }
      scrollable
    >
      <View style={{ gap: spacing.md }}>
        {saleCart.items.length === 0 ? (
          <AppText color={colors.textMuted} center>
            Cart is empty
          </AppText>
        ) : (
          saleCart.items.map((item) => (
            <Row key={item.key} style={{ gap: spacing.md }}>
              <AppImage uri={item.image} style={{ width: 48, height: 48 }} fallbackText={item.name} />
              <View style={{ flex: 1 }}>
                <AppText variant="small" weight="medium" numberOfLines={1}>
                  {item.name}
                </AppText>
                <AppText variant="small" color={colors.textMuted}>
                  {formatNGN(item.price)} × {item.quantity} = {formatNGN(item.price * item.quantity)}
                </AppText>
              </View>
              <Row style={{ gap: spacing.xs }}>
                <IconButton
                  accessibilityLabel="Decrease"
                  icon={<AppText style={{ fontSize: 14 }}>−</AppText>}
                  onPress={() =>
                    dispatch(updateSaleQuantity({ key: item.key, quantity: item.quantity - 1 }))
                  }
                />
                <AppText variant="small" weight="bold">
                  {item.quantity}
                </AppText>
                <IconButton
                  accessibilityLabel="Increase"
                  icon={<AppText style={{ fontSize: 14 }}>+</AppText>}
                  onPress={() =>
                    dispatch(updateSaleQuantity({ key: item.key, quantity: item.quantity + 1 }))
                  }
                />
                <IconButton
                  accessibilityLabel="Remove"
                  icon={<Ionicons name="trash-outline" size={16} color={colors.danger} />}
                  onPress={() => dispatch(removeSaleItem(item.key))}
                />
              </Row>
            </Row>
          ))
        )}
        <AppInputInline
          value={customerName}
          onChangeText={(name) => {
            setCustomerName(name);
            dispatch(setSaleCustomer({ name: name || undefined }));
          }}
          placeholder="Customer name (optional)"
        />
      </View>
    </AppModal>
  );
}

function AppInputInline({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) {
  const { colors, radius, spacing } = useAppTheme();
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceAlt,
        paddingHorizontal: spacing.md,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        style={{ color: colors.text, paddingVertical: spacing.md, fontSize: 14 }}
      />
    </View>
  );
}

function BarcodeScannerModal({
  visible,
  fetching,
  onClose,
  onScan,
}: {
  visible: boolean;
  fetching: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}) {
  const { colors, spacing } = useAppTheme();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!visible) {
      setScanned(false);
    }
  }, [visible]);

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center' }}>
        <CameraView
          style={{ width: '100%', aspectRatio: 1 }}
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'code128', 'code39', 'qr'] }}
          onBarcodeScanned={
            scanned
              ? undefined
              : ({ data }) => {
                  setScanned(true);
                  onScan(data);
                }
          }
        />
        <View style={{ padding: spacing.lg, alignItems: 'center', gap: spacing.md }}>
          <AppText color="#fff" center>
            {fetching ? 'Looking up product…' : 'Scan a product barcode'}
          </AppText>
          <Button title="Close Scanner" variant="outline" size="sm" fullWidth={false} onPress={onClose} />
        </View>
      </View>
    </RNModal>
  );
}

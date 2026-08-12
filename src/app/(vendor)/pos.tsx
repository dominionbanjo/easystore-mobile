import { useEffect, useRef, useState } from 'react';
import { Modal as RNModal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Button, IconButton } from '@/components/ui/Button';
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
  clearSaleCart,
  selectSaleCart,
} from '@/features/saleCartSlice';
import type { ISalesTerminalProduct, IProductVariant } from '@/types/product';
import type { SalePaymentMethod } from '@/features/saleCartSlice';

export default function PosScreen() {
  const { colors, spacing } = useAppTheme();
  const toast = useToast();
  const dispatch = useAppDispatch();

  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');

  const { data: productsData, isLoading } = useGetSalesTerminalProductsQuery({
    page: 1,
    limit: 100,
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
    toast.showSuccess(`${product.name} added`);
  };

  const barcodeHandledRef = useRef<string | null>(null);
  useEffect(() => {
    if (barcodeResult && barcodeHandledRef.current !== barcodeResult.id) {
      barcodeHandledRef.current = barcodeResult.id;
      handleProductPick({
        id: barcodeResult.id,
        name: barcodeResult.name,
        slug: barcodeResult.slug,
        price: barcodeResult.discount_price ?? barcodeResult.price,
        image: barcodeResult.image,
        stock: barcodeResult.stock ?? 0,
        variants: barcodeResult.variants,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barcodeResult]);

  const filteredProducts =
    categoryId === ''
      ? productsData?.items ?? []
      : (productsData?.items ?? []).filter(
          (product) => product.category?.id === categoryId,
        );

  const categoryCounts = new Map<string, number>();
  (productsData?.items ?? []).forEach((product) => {
    if (product.category?.id) {
      categoryCounts.set(product.category.id, (categoryCounts.get(product.category.id) ?? 0) + 1);
    }
  });

  const submitBarcode = () => {
    const code = barcodeInput.trim();
    if (!code) {
      return;
    }
    barcodeHandledRef.current = null;
    setBarcode(code);
    setBarcodeInput('');
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
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 4,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.surfaceAlt,
          }}
        >
          <Ionicons name="search" size={18} color={colors.textSubtle} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search products..."
            placeholderTextColor={colors.textSubtle}
            style={{ flex: 1, paddingVertical: 10, fontSize: 14, color: colors.text, fontFamily: 'Outfit_400Regular' }}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 4,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.surfaceAlt,
          }}
        >
          <TextInput
            value={barcodeInput}
            onChangeText={setBarcodeInput}
            onSubmitEditing={submitBarcode}
            placeholder="Scan barcode..."
            placeholderTextColor={colors.textSubtle}
            style={{ width: 110, paddingVertical: 10, fontSize: 13, color: colors.text, fontFamily: 'monospace' }}
          />
          <Ionicons name="barcode-outline" size={20} color="#17c06e" onPress={() => setScannerOpen(true)} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <Row style={{ padding: spacing.md, gap: spacing.sm }}>
          <ChipPill
            label={`All (${productsData?.items.length ?? 0})`}
            selected={categoryId === ''}
            onPress={() => setCategoryId('')}
          />
          {(categories ?? []).map((category) => (
            <ChipPill
              key={category.id}
              label={`${category.name} (${categoryCounts.get(category.id) ?? 0})`}
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
            {filteredProducts.map((product) => {
              const isLowStock = product.stock > 0 && product.stock <= 5;
              return (
                <Pressable
                  key={product.id}
                  onPress={() => handleProductPick(product)}
                  style={({ pressed }) => [{ width: '47%', opacity: pressed ? 0.85 : 1 }]}
                >
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: colors.surfaceAlt,
                      padding: 6,
                      marginBottom: spacing.md,
                    }}
                  >
                    <AppImage
                      uri={product.image}
                      style={{ width: '100%', aspectRatio: 1, borderRadius: 4 }}
                      fallbackText={product.name}
                    />
                    <View style={{ padding: 4, gap: 2 }}>
                      <AppText style={{ fontSize: 12, lineHeight: 15 }} weight="medium" numberOfLines={2}>
                        {product.name}
                      </AppText>
                      <AppText style={{ fontSize: 13 }} weight="bold" color="#17c06e">
                        {formatNGN(product.price)}
                      </AppText>
                      {isLowStock ? (
                        <AppText style={{ fontSize: 11 }} color="#f59e0b" weight="semibold">
                          {product.stock} left
                        </AppText>
                      ) : product.stock <= 0 ? (
                        <AppText style={{ fontSize: 11 }} color={colors.danger} weight="semibold">
                          Out of stock
                        </AppText>
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {saleCart.count > 0 ? (
        <Pressable
          onPress={() => setCartOpen(true)}
          style={{
            position: 'absolute',
            right: spacing.lg,
            bottom: spacing.lg,
            backgroundColor: '#17c06e',
            borderRadius: 999,
            padding: spacing.lg,
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            elevation: 6,
          }}
        >
          <View style={{ position: 'relative' }}>
            <Ionicons name="cart" size={22} color="#ffffff" />
            <View
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                minWidth: 18,
                height: 18,
                borderRadius: 4,
                backgroundColor: '#18181b',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 4,
              }}
            >
              <AppText style={{ fontSize: 10, fontWeight: '900' }} color="#ffffff">
                {saleCart.count}
              </AppText>
            </View>
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
          barcodeHandledRef.current = null;
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
                borderRadius: 999,
                backgroundColor: 'rgba(16,185,129,0.1)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="checkmark" size={32} color="#10b981" />
            </View>
            <AppText style={{ fontSize: 20 }} weight="black">
              Sale Complete
            </AppText>
            <AppText variant="label" color={colors.textMuted}>
              Order {receipt?.order_id.slice(0, 8)}
            </AppText>
            <AppText style={{ fontSize: 20 }} weight="extrabold" color="#17c06e">
              {formatNGN(receipt?.total ?? 0)}
            </AppText>
            <Button title="Done" onPress={() => setReceipt(null)} />
          </Card>
        </View>
      </RNModal>
    </View>
  );
}

function ChipPill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: selected ? '#17c06e' : '#f4f4f5',
      }}
    >
      <AppText style={{ fontSize: 13 }} weight="medium" color={selected ? '#ffffff' : '#71717a'}>
        {label}
      </AppText>
    </Pressable>
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
  const { colors, spacing, radius } = useAppTheme();
  const dispatch = useAppDispatch();
  const saleCart = useAppSelector(selectSaleCart);
  const [customerName, setCustomerName] = useState('');

  const paymentMethods: { value: SalePaymentMethod; label: string }[] = [
    { value: 'cash', label: 'Cash' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'pos', label: 'POS' },
  ];

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={`Cart (${saleCart.count} items)`}
      footer={
        <View style={{ gap: spacing.md }}>
          <AppText style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }} color={colors.textSubtle} weight="bold">
            Payment Method
          </AppText>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {paymentMethods.map((method) => {
              const selected = saleCart.paymentMethod === method.value;
              return (
                <Pressable
                  key={method.value}
                  onPress={() => dispatch(setSalePaymentMethod(method.value))}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 4,
                    backgroundColor: selected ? '#17c06e' : colors.surfaceAlt,
                    alignItems: 'center',
                  }}
                >
                  <AppText
                    style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}
                    weight="bold"
                    color={selected ? '#ffffff' : colors.textMuted}
                  >
                    {method.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <Row style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <AppText variant="label" color={colors.textMuted}>
              Total
            </AppText>
            <AppText style={{ fontSize: 20 }} weight="bold" color="#17c06e">
              {formatNGN(saleCart.total)}
            </AppText>
          </Row>
          <Button title="Complete Sale" onPress={onCheckout} loading={recording} size="lg" />
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
            <View
              key={item.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                backgroundColor: colors.surfaceAlt,
                borderRadius: radius.md,
                padding: spacing.md,
              }}
            >
              <AppImage uri={item.image} style={{ width: 48, height: 48, borderRadius: 4 }} fallbackText={item.name} />
              <View style={{ flex: 1 }}>
                <AppText style={{ fontSize: 12 }} weight="semibold" numberOfLines={1}>
                  {item.name}
                </AppText>
                <AppText style={{ fontSize: 13 }} weight="bold" color="#17c06e">
                  {formatNGN(item.price)}
                </AppText>
              </View>
              <Row style={{ gap: spacing.xs }}>
                <QtyButton label="−" onPress={() => dispatch(updateSaleQuantity({ key: item.key, quantity: item.quantity - 1 }))} />
                <AppText style={{ fontSize: 12 }} weight="bold">
                  {item.quantity}
                </AppText>
                <QtyButton label="+" onPress={() => dispatch(updateSaleQuantity({ key: item.key, quantity: item.quantity + 1 }))} />
                <Pressable onPress={() => dispatch(removeSaleItem(item.key))} hitSlop={6} style={{ marginLeft: 4 }}>
                  <Ionicons name="trash-outline" size={16} color={colors.textSubtle} />
                </Pressable>
              </Row>
            </View>
          ))
        )}
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 4,
            backgroundColor: colors.surfaceAlt,
            paddingHorizontal: spacing.md,
          }}
        >
          <TextInput
            value={customerName}
            onChangeText={(name) => {
              setCustomerName(name);
              dispatch(setSaleCustomer({ name: name || undefined }));
            }}
            placeholder="Customer name (optional)"
            placeholderTextColor={colors.textSubtle}
            style={{ color: colors.text, paddingVertical: spacing.md, fontSize: 14, fontFamily: 'Outfit_400Regular' }}
          />
        </View>
      </View>
    </AppModal>
  );
}

function QtyButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 24,
        height: 24,
        borderRadius: 4,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <AppText style={{ fontSize: 13 }} color={colors.text}>
        {label}
      </AppText>
    </Pressable>
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
  const { spacing } = useAppTheme();
  const scannedRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      scannedRef.current = false;
    }
  }, [visible]);

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center' }}>
        <CameraView
          style={{ width: '100%', aspectRatio: 1 }}
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'code128', 'code39', 'qr'] }}
          onBarcodeScanned={({ data }) => {
            if (scannedRef.current) {
              return;
            }
            scannedRef.current = true;
            onScan(data);
          }}
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

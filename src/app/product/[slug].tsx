import { CalendarDays, Heart, MapPin, RotateCcw, Store, Truck } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';


import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Button, IconButton } from '@/components/ui/Button';
import { ProductGallery } from '@/components/shared/ProductGallery';
import { ProductRail } from '@/components/shared/ProductCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { RatingStars } from '@/components/shared/RatingStars';
import { Card } from '@/components/ui/Card';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { AppModal } from '@/components/ui/Modal';
import { formatNaira } from '@/utils/money';
import { useGetProductBySlugQuery } from '@/api/productApi';
import { useGetInstallmentConfigQuery } from '@/api/installmentApi';
import { useAddCartItemMutation } from '@/api/cartApi';
import { useAddToWishlistMutation, useRemoveFromWishlistMutation } from '@/api/wishlistApi';
import { useGetProductReviewsQuery } from '@/api/reviewApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { addGuestItem } from '@/features/cartSlice';
import type { IProductDetails, IProductVariant } from '@/types/product';

interface SelectedVariant {
  variant?: IProductVariant;
  size?: string;
  color?: string;
  options: Record<string, string>;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  const { colors, spacing, radius } = useAppTheme();
  return (
    <Row style={{ gap: spacing.md, alignItems: 'flex-start' }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: radius.sm,
          backgroundColor: colors.primaryMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText
          variant="small"
          weight="semibold"
          color={colors.textMuted}
          style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          {label}
        </AppText>
        <AppText variant="small">{value}</AppText>
      </View>
    </Row>
  );
}

function normalizeProduct(
  raw: IProductDetails | { product?: IProductDetails } | undefined,
): IProductDetails | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const nested = (raw as { product?: IProductDetails }).product;
  if (nested && typeof nested.name === 'string' && typeof nested.id === 'string') {
    return nested;
  }
  if (typeof (raw as IProductDetails).name === 'string' && typeof (raw as IProductDetails).id === 'string') {
    return raw as IProductDetails;
  }
  return null;
}

export default function ProductDetailScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const router = useRouter();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ slug: string }>();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const { data: rawProduct, isLoading, isError, refetch } = useGetProductBySlugQuery(params.slug);
  const product = normalizeProduct(rawProduct);
  const relatedProducts = rawProduct?.related_products ?? [];
  const detailStore = rawProduct?.store;
  const shipFromLocation = [
    detailStore?.address_city,
    detailStore?.address_state,
    detailStore?.address_country,
  ]
    .filter((part): part is string => typeof part === 'string' && part.length > 0)
    .join(', ');
  const { data: reviewsData } = useGetProductReviewsQuery(product?.id ?? '', {
    skip: !product?.id,
  });
  const { data: installmentConfig } = useGetInstallmentConfigQuery();
  const [addCartItem] = useAddCartItemMutation();
  const [addWishlist] = useAddToWishlistMutation();
  const [removeWishlist] = useRemoveFromWishlistMutation();

  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedVariant>({ options: {} });
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <View style={{ padding: spacing.lg }}>
        <ListSkeleton count={3} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ padding: spacing.xl, gap: spacing.md }}>
        <AppText center color={colors.textMuted}>
          Failed to load product
        </AppText>
        <Button
          title="Retry"
          variant="outline"
          fullWidth={false}
          style={{ alignSelf: 'center' }}
          onPress={refetch}
        />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ padding: spacing.xl }}>
        <AppText center color={colors.textMuted}>
          Product not found
        </AppText>
      </View>
    );
  }

  const gallery = [
    typeof product.image === 'string' ? product.image : undefined,
    ...(product.gallery ?? []).map((image) => (typeof image.url === 'string' ? image.url : undefined)),
  ].filter((url): url is string => Boolean(url));

  const hasVariants = (product.variants?.length ?? 0) > 0;
  const hasOptions = (product.options?.length ?? 0) > 0;
  const needsSelection = hasVariants || hasOptions;

  const effectiveVariant = selected.variant;
  const unitPrice = effectiveVariant
    ? (effectiveVariant.discount_price ?? effectiveVariant.price)
    : (product.discount_price ?? product.price);
  const unitStock = effectiveVariant ? effectiveVariant.stock : product.stock;

  const applyVariantSelection = (variants: IProductVariant[] | undefined): IProductVariant | undefined => {
    if (!variants || variants.length === 0) {
      return undefined;
    }
    const match = variants.find((variant) => {
      const combos = variant.combinations ?? {};
      return Object.entries(selected.options).every(
        ([optionName, optionValue]) => combos[optionName] === optionValue,
      );
    });
    return match;
  };

  const isOptionAvailable = (optionName: string, value: string): boolean =>
    (product.variants ?? []).some(
      (variant) => variant.combinations?.[optionName] === value && variant.stock > 0,
    );

  const handleVariantConfirm = () => {
    setSelected((current) => ({
      ...current,
      variant: applyVariantSelection(product.variants),
    }));
    setVariantModalOpen(false);
  };

  const handleAddToCart = async (): Promise<boolean> => {
    if (needsSelection && !effectiveVariant) {
      setVariantModalOpen(true);
      return false;
    }
    const cartPayload = {
      product_id: product.id,
      variant_id: effectiveVariant?.id,
      quantity,
      size: selected.size,
      color: selected.color,
    };
    if (isAuthenticated) {
      try {
        await addCartItem(cartPayload).unwrap();
        toast.showSuccess('Added to cart');
        return true;
      } catch (error) {
        toast.showError(getErrorMessage(error));
        return false;
      }
    }
    dispatch(
      addGuestItem({
        product_id: product.id,
        name: product.name,
        slug: product.slug,
        price: unitPrice ?? 0,
        image:
          typeof product.image === 'string'
            ? product.image
            : (product.image?.url ?? null),
        quantity,
        variant_id: effectiveVariant?.id,
        variant_options: effectiveVariant?.combinations,
        installment_enabled: product.installment_enabled,
        installment_presets: product.installment_presets,
      }),
    );
    toast.showSuccess('Added to cart');
    return true;
  };

  const handleBuyNow = async () => {
    if (await handleAddToCart()) {
      router.push('/cart');
    }
  };

  const handleToggleWishlist = async () => {
    try {
      if (product.is_in_wishlist) {
        await removeWishlist(product.id).unwrap();
        toast.showSuccess('Removed from wishlist');
      } else {
        await addWishlist({ product_id: product.id }).unwrap();
        toast.showSuccess('Added to wishlist');
      }
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  return (
    <>
      <Stack.Screen
        options={{ title: (product.name ?? 'Product').slice(0, 40), headerShown: true }}
      />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <ProductGallery images={gallery} fallbackText={product.name} />

        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Row style={{ justifyContent: 'space-between', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle" weight="bold">
                {product.name}
              </AppText>
              {product.store_name ? (
                <Row style={{ gap: spacing.xs, marginTop: 4 }}>
                  <Store size={14} color={colors.textSubtle} />
                  <AppText variant="caption" color={colors.textSubtle}>
                    {product.store_name}
                  </AppText>
                </Row>
              ) : null}
              <View style={{ marginTop: 6 }}>
                <RatingStars rating={product.rating_average} />
              </View>
            </View>
            <IconButton
              accessibilityLabel="Toggle wishlist"
              icon={
                <Heart
                  size={22}
                  color={product.is_in_wishlist ? colors.danger : colors.textMuted}
                  fill={product.is_in_wishlist ? colors.danger : 'transparent'}
                  strokeWidth={2}
                />
              }
              onPress={handleToggleWishlist}
            />
          </Row>

          <Row style={{ gap: spacing.md, alignItems: 'baseline' }}>
            <AppText variant="title" weight="bold" color={colors.primary}>
              {formatNaira(unitPrice)}
            </AppText>
            {product.discount_price ? (
              <AppText
                variant="label"
                color={colors.textSubtle}
                style={{ textDecorationLine: 'line-through' }}
              >
                {formatNaira(product.price)}
              </AppText>
            ) : null}
            {typeof unitStock === 'number' ? (
              <AppText variant="small" color={unitStock > 0 ? colors.success : colors.danger}>
                {unitStock > 0 ? `${unitStock} in stock` : 'Out of stock'}
              </AppText>
            ) : null}
          </Row>

          {typeof unitStock === 'number' && unitStock > 0 && unitStock <= 5 ? (
            <AppText variant="small" weight="semibold" color={colors.warning}>
              Only {unitStock} pieces left!
            </AppText>
          ) : null}

          {needsSelection ? (
            <Card style={{ gap: spacing.sm }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <AppText variant="label" weight="semibold">
                  {effectiveVariant ? 'Selected' : 'Select Options'}
                </AppText>
                <Button
                  title={effectiveVariant ? 'Change' : 'Choose'}
                  variant="outline"
                  size="sm"
                  fullWidth={false}
                  onPress={() => setVariantModalOpen(true)}
                />
              </Row>
              {effectiveVariant ? (
                <AppText variant="caption" color={colors.textMuted}>
                  {Object.entries(effectiveVariant.combinations ?? {})
                    .map(([name, value]) => `${name}: ${value}`)
                    .join(' · ')}
                </AppText>
              ) : null}
            </Card>
          ) : null}

          {product.description ? (
            <Card style={{ gap: spacing.sm }}>
              <AppText variant="label" weight="semibold">
                Description
              </AppText>
              <AppText variant="caption" color={colors.textMuted}>
                {product.description}
              </AppText>
            </Card>
          ) : null}

          {product.highlights && product.highlights.length > 0 ? (
            <Card style={{ gap: spacing.sm }}>
              <AppText variant="label" weight="semibold">
                Highlights
              </AppText>
              {product.highlights.map((highlight, index) => (
                <Row key={index} style={{ gap: spacing.sm }}>
                  <AppText color={colors.primary}>•</AppText>
                  <AppText variant="caption" color={colors.textMuted} style={{ flex: 1 }}>
                    {highlight}
                  </AppText>
                </Row>
              ))}
            </Card>
          ) : null}

          {product.shipping_note || product.returns_note || shipFromLocation ? (
            <Card style={{ gap: spacing.md }}>
              <Row style={{ gap: spacing.sm }}>
                <Truck size={18} color={colors.primary} />
                <AppText variant="label" weight="semibold">
                  Delivery &amp; Logistics
                </AppText>
              </Row>
              {product.shipping_note ? (
                <InfoRow icon={Truck} label="Estimated Delivery" value={product.shipping_note} />
              ) : null}
              {product.returns_note ? (
                <InfoRow icon={RotateCcw} label="Return Policy" value={product.returns_note} />
              ) : null}
              {shipFromLocation ? (
                <InfoRow icon={MapPin} label="Ship From" value={shipFromLocation} />
              ) : null}
            </Card>
          ) : null}

          {product.specs && Object.keys(product.specs).length > 0 ? (
            <Card style={{ gap: spacing.xs }}>
              <AppText variant="label" weight="semibold">
                Specifications
              </AppText>
              {Object.entries(product.specs).map(([key, value]) => (
                <Row
                  key={key}
                  style={{
                    justifyContent: 'space-between',
                    gap: spacing.md,
                    paddingVertical: spacing.xs,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <AppText variant="small" color={colors.textMuted} style={{ flex: 1 }}>
                    {key}
                  </AppText>
                  <AppText variant="small" weight="medium" numberOfLines={2} style={{ flex: 1, textAlign: 'right' }}>
                    {value}
                  </AppText>
                </Row>
              ))}
            </Card>
          ) : null}

          {product.installment_enabled && (product.installment_presets?.length ?? 0) > 0 ? (
            <Card style={{ gap: spacing.sm }}>
              <Row style={{ gap: spacing.sm }}>
                <CalendarDays size={18} color={colors.primary} />
                <AppText variant="label" weight="semibold">
                  Pay in installments
                </AppText>
              </Row>
              {product.installment_presets?.map((presetId) => {
                const preset = installmentConfig?.presets.find((p) => p.id === presetId);
                return preset ? (
                  <AppText key={preset.id} variant="small" color={colors.textMuted}>
                    • {preset.name} — {preset.count} payments every {preset.interval_days} days
                  </AppText>
                ) : null;
              })}
            </Card>
          ) : null}

          <Card style={{ gap: spacing.md }}>
            <AppText variant="label" weight="semibold">
              Reviews ({reviewsData?.length ?? product.review_count ?? 0})
            </AppText>
            {reviewsData && reviewsData.length > 0 ? (
              reviewsData.slice(0, 3).map((review) => (
                <View key={review.id} style={{ gap: 4 }}>
                  <Row style={{ gap: spacing.sm }}>
                    <RatingStars rating={review.rating} showValue={false} />
                    <AppText variant="small" weight="semibold">
                      {review.user
                        ? `${review.user.first_name} ${review.user.last_name}`
                        : 'Customer'}
                    </AppText>
                  </Row>
                  {review.comment ? (
                    <AppText variant="caption" color={colors.textMuted}>
                      {review.comment}
                    </AppText>
                  ) : null}
                </View>
              ))
            ) : (
              <AppText variant="caption" color={colors.textSubtle}>
                No reviews yet
              </AppText>
            )}
          </Card>

          {relatedProducts.length > 0 ? (
            <View style={{ marginTop: spacing.sm }}>
              <SectionHeader
                title="Related Products"
                subtitle="More items you might like"
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Row style={{ gap: spacing.md }}>
                  <ProductRail products={relatedProducts.slice(0, 10)} width={210} />
                </Row>
              </ScrollView>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={{
          padding: spacing.lg,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          gap: spacing.sm,
        }}
      >
        <Row style={{ gap: spacing.md }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.sm,
              paddingHorizontal: spacing.sm,
              gap: spacing.sm,
            }}
          >
            <IconButton
              accessibilityLabel="Decrease quantity"
              icon={
                <AppText style={{ fontSize: 18 }} color={colors.text}>
                  −
                </AppText>
              }
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            />
            <AppText variant="label" weight="bold">
              {quantity}
            </AppText>
            <IconButton
              accessibilityLabel="Increase quantity"
              icon={
                <AppText style={{ fontSize: 18 }} color={colors.text}>
                  +
                </AppText>
              }
              onPress={() => setQuantity((q) => Math.min(unitStock || 99, q + 1))}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Add to Cart" onPress={handleAddToCart} />
          </View>
        </Row>
        <Button title="Buy Now" variant="outline" onPress={handleBuyNow} />
      </View>

      <AppModal
        visible={variantModalOpen}
        onClose={() => setVariantModalOpen(false)}
        title="Select Options"
        footer={
          <Button title="Confirm Selection" onPress={handleVariantConfirm} />
        }
      >
        <View style={{ gap: spacing.md }}>
          {product.options?.map((option) => (
            <View key={option.name} style={{ gap: spacing.sm }}>
              <AppText variant="label" weight="semibold">
                {option.name}
              </AppText>
              <Row style={{ flexWrap: 'wrap', gap: spacing.sm }}>
                {option.values.map((value) => {
                  const isSelected = selected.options[option.name] === value;
                  const available = isOptionAvailable(option.name, value);
                  return (
                    <Button
                      key={value}
                      title={value}
                      variant={isSelected ? 'primary' : 'outline'}
                      size="sm"
                      fullWidth={false}
                      disabled={!available}
                      onPress={() =>
                        setSelected((current) => ({
                          ...current,
                          options: { ...current.options, [option.name]: value },
                        }))
                      }
                    />
                  );
                })}
              </Row>
            </View>
          ))}
          <Row style={{ gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <AppText variant="label" color={colors.textMuted}>
                Quantity
              </AppText>
            </View>
            <Row style={{ gap: spacing.sm }}>
              <IconButton
                accessibilityLabel="Decrease quantity"
                icon={<AppText style={{ fontSize: 16 }}>−</AppText>}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              />
              <AppText variant="label" weight="bold">
                {quantity}
              </AppText>
              <IconButton
                accessibilityLabel="Increase quantity"
                icon={<AppText style={{ fontSize: 16 }}>+</AppText>}
                onPress={() => setQuantity((q) => q + 1)}
              />
            </Row>
          </Row>
        </View>
      </AppModal>
    </>
  );
}

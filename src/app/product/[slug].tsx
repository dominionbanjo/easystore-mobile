import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Button, IconButton } from '@/components/ui/Button';
import { AppImage } from '@/components/shared/AppImage';
import { RatingStars } from '@/components/shared/RatingStars';
import { Card } from '@/components/ui/Card';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { AppModal } from '@/components/ui/Modal';
import { formatNaira } from '@/utils/money';
import { useGetProductBySlugQuery } from '@/api/productApi';
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
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ slug: string }>();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const { data: rawProduct, isLoading } = useGetProductBySlugQuery(params.slug);
  const product = normalizeProduct(rawProduct);
  const { data: reviewsData } = useGetProductReviewsQuery(product?.id ?? '', {
    skip: !product?.id,
  });
  const [addCartItem] = useAddCartItemMutation();
  const [addWishlist] = useAddToWishlistMutation();
  const [removeWishlist] = useRemoveFromWishlistMutation();

  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedVariant>({ options: {} });
  const [quantity, setQuantity] = useState(1);
  const [activeImage] = useState(0);

  if (isLoading) {
    return (
      <View style={{ padding: spacing.lg }}>
        <ProductGridSkeleton count={2} />
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
  const activeImageUrl = gallery[activeImage] ?? (typeof product.image === 'string' ? product.image : undefined);

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

  const handleVariantConfirm = () => {
    setSelected((current) => ({
      ...current,
      variant: applyVariantSelection(product.variants),
    }));
    setVariantModalOpen(false);
  };

  const handleAddToCart = async () => {
    if (needsSelection && !effectiveVariant) {
      setVariantModalOpen(true);
      return;
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
      } catch (error) {
        toast.showError(getErrorMessage(error));
      }
    } else {
      dispatch(
        addGuestItem({
          product_id: product.id,
          name: product.name,
          slug: product.slug,
          price: unitPrice,
          image: product.image,
          quantity,
          variant_id: effectiveVariant?.id,
          variant_options: effectiveVariant?.combinations,
          installment_enabled: product.installment_enabled,
          installment_presets: product.installment_presets,
        }),
      );
      toast.showSuccess('Added to cart');
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/cart');
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
        <AppImage
          uri={activeImageUrl}
          style={{ width: '100%', aspectRatio: 1 }}
          fallbackText={product.name}
        />
        {gallery.length > 1 ? (
          <Row style={{ justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md }}>
            {gallery.map((url, index) => (
              <View
                key={`${url}-${index}`}
                style={{
                  width: index === activeImage ? 10 : 8,
                  height: index === activeImage ? 10 : 8,
                  borderRadius: 6,
                  backgroundColor:
                    index === activeImage ? colors.primary : colors.border,
                }}
              />
            ))}
          </Row>
        ) : null}

        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Row style={{ justifyContent: 'space-between', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle" weight="bold">
                {product.name}
              </AppText>
              {product.store_name ? (
                <Row style={{ gap: spacing.xs, marginTop: 4 }}>
                  <Ionicons name="storefront-outline" size={14} color={colors.textSubtle} />
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
                <Ionicons
                  name={product.is_in_wishlist ? 'heart' : 'heart-outline'}
                  size={22}
                  color={product.is_in_wishlist ? colors.danger : colors.textMuted}
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

          {product.installment_enabled && (product.installment_presets?.length ?? 0) > 0 ? (
            <Card style={{ gap: spacing.sm }}>
              <Row style={{ gap: spacing.sm }}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <AppText variant="label" weight="semibold">
                  Pay in installments
                </AppText>
              </Row>
              {product.installment_presets?.map((preset) => (
                <AppText key={preset.id} variant="small" color={colors.textMuted}>
                  • {preset.name} ({preset.count} payments)
                </AppText>
              ))}
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
              borderRadius: 12,
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
                  return (
                    <Button
                      key={value}
                      title={value}
                      variant={isSelected ? 'primary' : 'outline'}
                      size="sm"
                      fullWidth={false}
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

import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, ShoppingCart, Star } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { useAppSelector } from '@/hooks';
import { useToast } from '@/hooks/useToast';
import { AppText, Row } from '../ui/Text';
import { AppImage } from './AppImage';
import { formatNaira } from '@/utils/money';
import { useAddToWishlistMutation, useRemoveFromWishlistMutation } from '@/api/wishlistApi';
import type { IProduct } from '@/types/product';

export function ProductCard({
  product,
  onPress,
  railWidth,
}: {
  product: IProduct;
  onPress?: () => void;
  railWidth?: number;
}) {
  const { colors, radius } = useAppTheme();
  const isDark = useAppTheme().isDark;
  const router = useRouter();
  const toast = useToast();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [wishlist, setWishlist] = useState(Boolean(product.is_in_wishlist));
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    router.push({ pathname: '/product/[slug]', params: { slug: product.slug } });
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.showInfo('Sign in to save');
      return;
    }
    if (wishlist) {
      try {
        await removeFromWishlist(product.id).unwrap();
        setWishlist(false);
      } catch {
        toast.showError('Could not remove from wishlist');
      }
    } else {
      try {
        await addToWishlist({ product_id: product.id }).unwrap();
        setWishlist(true);
      } catch {
        toast.showError('Could not save to wishlist');
      }
    }
  };

  const price = product.discount_price ?? product.price;
  const discountPct =
    product.discount_price && (product.price ?? 0) > 0
      ? Math.round(((product.price ?? 0) - product.discount_price) / (product.price ?? 1) * 100)
      : 0;
  const stock = product.stock ?? 0;
  const isOutOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= 5;
  const categoryName = typeof product.category === 'string' ? product.category : undefined;

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [pressed && { opacity: 0.9 }, { flex: 1 }]}>
      <View
        style={{
          width: railWidth ?? '100%',
          flex: 1,
          backgroundColor: colors.surface,
          borderRadius: radius.sm,
          padding: 4,
          borderWidth: 1,
          borderColor: colors.surfaceAlt,
        }}
      >
        <View
          style={{
            width: '100%',
            aspectRatio: 1,
            borderRadius: radius.sm,
            backgroundColor: colors.surfaceAlt,
            overflow: 'hidden',
          }}
        >
          <AppImage uri={product.image} style={{ width: '100%', height: '100%', borderRadius: 0 }} fallbackText={product.name} />
          <View style={{ position: 'absolute', top: 8, right: 8, gap: 6, alignItems: 'flex-end' }}>
            {isOutOfStock ? (
              <View style={{ backgroundColor: 'rgba(24,24,27,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm }}>
                <AppText style={{ fontSize: 9, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' }} color="#ffffff">
                  Sold Out
                </AppText>
              </View>
            ) : null}
            {discountPct > 0 ? (
              <View style={{ backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.sm, transform: [{ scale: 1.1 }] }}>
                <AppText style={{ fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }} color="#ffffff">
                  {discountPct}% OFF
                </AppText>
              </View>
            ) : null}
          </View>
          <Pressable
            onPress={handleWishlist}
            hitSlop={8}
            style={{ position: 'absolute', top: 6, left: 6 }}
          >
            <Heart
              size={22}
              color={wishlist ? '#f43f5e' : colors.textSubtle}
              fill={wishlist ? '#f43f5e' : 'transparent'}
              strokeWidth={2}
            />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 6, paddingTop: 8, gap: 4 }}>
          {categoryName || Number(product.rating_average) > 0 ? (
            <Row style={{ justifyContent: 'space-between', gap: 6 }}>
              {categoryName ? (
                <View style={{ backgroundColor: isDark ? 'rgba(16,185,129,0.14)' : 'rgba(16,185,129,0.08)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm, flexShrink: 1 }}>
                  <AppText style={{ fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }} color={isDark ? '#34d399' : '#059669'} numberOfLines={1}>
                    {categoryName}
                  </AppText>
                </View>
              ) : (
                <View />
              )}
              {Number(product.rating_average) > 0 ? (
                <Row style={{ backgroundColor: isDark ? 'rgba(245,158,11,0.1)' : '#fffbeb', borderWidth: 1, borderColor: isDark ? 'rgba(245,158,11,0.3)' : 'rgba(251,191,36,0.4)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, gap: 3 }}>
                  <Star size={10} color="#f59e0b" fill="#f59e0b" />
                  <AppText style={{ fontSize: 9, fontWeight: '700' }} color={isDark ? '#fbbf24' : '#b45309'}>
                    {Number(product.rating_average).toFixed(1)}
                  </AppText>
                </Row>
              ) : null}
            </Row>
          ) : null}
          <AppText
            numberOfLines={2}
            weight="bold"
            style={{ fontSize: 12, lineHeight: 16 }}
          >
            {product.name}
          </AppText>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
            <View style={{ gap: 0, flexShrink: 1 }}>
              {product.discount_price ? (
                <AppText style={{ fontSize: 9, textDecorationLine: 'line-through', textDecorationColor: 'rgba(244,63,94,0.3)' }} color={colors.textSubtle} numberOfLines={1}>
                  {formatNaira(product.price)}
                </AppText>
              ) : null}
              <AppText style={{ fontSize: 14, letterSpacing: -0.3 }} weight="extrabold" numberOfLines={1}>
                {formatNaira(price)}
              </AppText>
            </View>
            <Pressable
              disabled={isOutOfStock}
              onPress={handlePress}
              style={{
                padding: 6,
                borderRadius: radius.sm,
                backgroundColor: isOutOfStock ? colors.surfaceAlt : '#18181b',
              }}
            >
              <ShoppingCart
                size={16}
                color={isOutOfStock ? colors.textSubtle : '#ffffff'}
                strokeWidth={2}
              />
            </Pressable>
          </Row>
          <View style={{ marginTop: 4, gap: 3 }}>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
              <View
                style={{
                  width: isOutOfStock ? 0 : lowStock ? '20%' : '75%',
                  height: '100%',
                  borderRadius: 2,
                  backgroundColor: isOutOfStock ? colors.border : lowStock ? '#f59e0b' : '#10b981',
                }}
              />
            </View>
            <AppText
              style={{ fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}
              color={isOutOfStock ? colors.textSubtle : lowStock ? '#f59e0b' : '#10b981'}
            >
              {isOutOfStock ? 'Out of Stock' : lowStock ? `${stock} Left!` : 'In Stock'}
            </AppText>
          </View>
        </View>

        {product.store_name ? (
          <View
            style={{
              marginTop: 8,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: colors.surfaceAlt,
              paddingHorizontal: 4,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: radius.sm,
                borderWidth: 2,
                borderColor: colors.surface,
                backgroundColor: colors.surfaceAlt,
                overflow: 'hidden',
              }}
            >
              <AppImage
                uri={product.image}
                style={{ width: '100%', height: '100%', borderRadius: 0 }}
                fallbackText=""
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 }} color={colors.textSubtle} weight="medium">
                Seller
              </AppText>
              <AppText style={{ fontSize: 12 }} weight="bold" numberOfLines={1}>
                {product.store_name}
              </AppText>
            </View>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export function ProductGrid({
  products,
  columns = 2,
}: {
  products: IProduct[];
  columns?: number;
}) {
  const { spacing } = useAppTheme();
  const width = 100 / columns - 1.5;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {products.map((product) => (
        <View
          key={product.id}
          style={{ width: `${width}%`, marginBottom: spacing.md }}
        >
          <ProductCard product={product} />
        </View>
      ))}
    </View>
  );
}

export function ProductRail({ products, width = 210 }: { products: IProduct[]; width?: number }) {
  const { spacing } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.md }}>
      {products.map((product) => (
        <View key={product.id} style={{ width }}>
          <ProductCard product={product} railWidth={width} />
        </View>
      ))}
    </View>
  );
}

import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '../ui/Text';
import { AppImage } from './AppImage';
import { formatNaira } from '@/utils/money';
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
  const router = useRouter();
  const [wishlist, setWishlist] = useState(Boolean(product.is_in_wishlist));

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    router.push({ pathname: '/product/[slug]', params: { slug: product.slug } });
  };

  const price = product.discount_price ?? product.price;
  const discountPct =
    product.discount_price && product.price > 0
      ? Math.round(((product.price - product.discount_price) / product.price) * 100)
      : 0;
  const stock = product.stock ?? 0;
  const isOutOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= 5;
  const categoryName = product.category?.name;

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
      <View
        style={{
          width: railWidth ?? '100%',
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
          <View style={{ position: 'absolute', top: 6, right: 6, gap: 4, alignItems: 'flex-end' }}>
            {isOutOfStock ? (
              <View style={{ backgroundColor: 'rgba(24,24,27,0.9)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm }}>
                <AppText style={{ fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }} color="#ffffff">
                  Sold Out
                </AppText>
              </View>
            ) : null}
            {discountPct > 0 ? (
              <View style={{ backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm }}>
                <AppText style={{ fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }} color="#ffffff">
                  {discountPct}% OFF
                </AppText>
              </View>
            ) : null}
          </View>
          <Pressable
            onPress={() => setWishlist((current) => !current)}
            hitSlop={8}
            style={{ position: 'absolute', top: 6, left: 6 }}
          >
            <Ionicons
              name={wishlist ? 'heart' : 'heart-outline'}
              size={22}
              color={wishlist ? '#f43f5e' : colors.textSubtle}
            />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 6, paddingTop: 8, gap: 4 }}>
          {(categoryName || Number(product.rating_average) > 0) ? (
            <Row style={{ gap: 6 }}>
              {categoryName ? (
                <View style={{ backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm }}>
                  <AppText style={{ fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }} color="#059669">
                    {categoryName}
                  </AppText>
                </View>
              ) : null}
              {Number(product.rating_average) > 0 ? (
                <Row style={{ backgroundColor: '#fffbeb', borderWidth: 1, borderColor: 'rgba(251,191,36,0.4)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, gap: 3 }}>
                  <AppText style={{ fontSize: 9, color: '#f59e0b' }}>★</AppText>
                  <AppText style={{ fontSize: 9, fontWeight: '700' }} color="#b45309">
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
            <View style={{ gap: 0 }}>
              {product.discount_price ? (
                <AppText style={{ fontSize: 9, textDecorationLine: 'line-through' }} color={colors.textSubtle}>
                  {formatNaira(product.price)}
                </AppText>
              ) : null}
              <AppText style={{ fontSize: 14 }} weight="extrabold">
                {formatNaira(price)}
              </AppText>
            </View>
            <Pressable
              disabled={isOutOfStock}
              style={{
                padding: 6,
                borderRadius: radius.sm,
                backgroundColor: isOutOfStock ? colors.surfaceAlt : '#18181b',
              }}
            >
              <Ionicons
                name="cart"
                size={16}
                color={isOutOfStock ? colors.textSubtle : '#ffffff'}
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
            }}
          >
            <AppText style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 }} color={colors.textSubtle} weight="medium">
              Seller
            </AppText>
            <AppText style={{ fontSize: 12 }} weight="bold" numberOfLines={1}>
              {product.store_name}
            </AppText>
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
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
      {products.map((product) => (
        <View key={product.id} style={{ width: `${100 / columns - 4.5}%` }}>
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
        <ProductCard key={product.id} product={product} railWidth={width} />
      ))}
    </View>
  );
}

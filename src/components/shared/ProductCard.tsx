import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/theme';
import { AppText, Row } from '../ui/Text';
import { AppImage } from './AppImage';
import { formatNGN } from '@/utils/money';
import type { IProduct } from '@/types/product';

export function ProductCard({
  product,
  compact = false,
  onPress,
}: {
  product: IProduct;
  compact?: boolean;
  onPress?: () => void;
}) {
  const { colors, radius, spacing } = useAppTheme();
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    router.push({ pathname: '/product/[slug]', params: { slug: product.slug } });
  };

  const price = product.discount_price ?? product.price;

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        }}
      >
        <AppImage
          uri={product.image}
          style={{ width: '100%', height: compact ? 110 : 150 }}
          fallbackText={product.name}
        />
        <View style={{ padding: spacing.sm, gap: 4 }}>
          {product.store_name ? (
            <AppText variant="small" color={colors.textSubtle} numberOfLines={1}>
              {product.store_name}
            </AppText>
          ) : null}
          <AppText
            variant="label"
            weight="medium"
            numberOfLines={1}
            style={{ fontSize: compact ? 12 : 13 }}
          >
            {product.name}
          </AppText>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="label" weight="bold" color={colors.primary}>
              {formatNGN(price)}
            </AppText>
            {product.discount_price ? (
              <AppText variant="small" color={colors.textSubtle} style={{ textDecorationLine: 'line-through' }}>
                {formatNGN(product.price)}
              </AppText>
            ) : null}
          </Row>
        </View>
      </View>
    </Pressable>
  );
}

export function ProductGrid({
  products,
  compact = false,
}: {
  products: IProduct[];
  compact?: boolean;
}) {
  const { spacing } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
      {products.map((product) => (
        <View key={product.id} style={{ width: '47%' }}>
          <ProductCard product={product} compact={compact} />
        </View>
      ))}
    </View>
  );
}

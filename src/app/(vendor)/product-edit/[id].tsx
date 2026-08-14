import { ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ProductForm } from '@/components/shared/ProductForm';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { AppText } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useAppTheme } from '@/theme';
import { useGetVendorProductsQuery } from '@/api/productApi';
import type { IProductDetails, IStoreProduct } from '@/types/product';

function toEditableProduct(product: IStoreProduct): IProductDetails {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    discount_price: product.discount_price,
    stock: product.stock,
    image: product.image,
    category_id: product.category_ref?.id,
    category_ref: product.category_ref,
    status: product.status,
    is_out_of_stock: product.is_out_of_stock,
    on_sale: product.on_sale,
    featured: product.featured,
    options: product.options,
    variants: product.variants,
    total_sold: product.total_sold,
    rating_average: product.rating_average,
    created_at: product.created_at,
    vendor_id: '',
    store_id: '',
  };
}

export default function ProductEditScreen() {
  const { colors, spacing } = useAppTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useGetVendorProductsQuery({ limit: 100 });
  const product = data?.items.find((item) => item.id === params.id);

  if (isLoading) {
    return (
      <View style={{ padding: spacing.lg }}>
        <ListSkeleton count={6} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ padding: spacing.xl, gap: spacing.md }}>
        <AppText center color={colors.textMuted}>
          Couldn&apos;t load this product
        </AppText>
        <Button title="Try Again" onPress={refetch} />
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

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <ProductForm initial={toEditableProduct(product)} mode="edit" />
    </ScrollView>
  );
}

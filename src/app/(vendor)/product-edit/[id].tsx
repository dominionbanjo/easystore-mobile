import { ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ProductForm } from '@/components/shared/ProductForm';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { AppText } from '@/components/ui/Text';
import { useAppTheme } from '@/theme';
import { useGetProductBySlugQuery } from '@/api/productApi';

export default function ProductEditScreen() {
  const { spacing } = useAppTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading } = useGetProductBySlugQuery(params.id);

  if (isLoading) {
    return (
      <View style={{ padding: spacing.lg }}>
        <ListSkeleton count={6} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ padding: spacing.xl }}>
        <AppText center color="gray">
          Product not found
        </AppText>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <ProductForm initial={product} mode="edit" />
    </ScrollView>
  );
}

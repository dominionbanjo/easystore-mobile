import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { useAppTheme } from '@/theme';
import { AppText } from '@/components/ui/Text';
import { ProductGrid } from '@/components/shared/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { useGetProductsByCategoryQuery } from '@/api/productApi';

export default function CategoryScreen() {
  const { colors, spacing } = useAppTheme();
  const params = useLocalSearchParams<{ slug: string }>();
  const [page] = useState(1);

  const { data, isLoading } = useGetProductsByCategoryQuery({
    identifier: params.slug,
    page,
    limit: 20,
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Category', headerShown: true }} />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg }}>
        <AppText style={{ fontSize: 20, letterSpacing: -0.4, marginBottom: spacing.md }} weight="black">
          {params.slug.replace(/-/g, ' ')}
        </AppText>
        {isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : data && data.items.length > 0 ? (
          <ProductGrid products={data.items} />
        ) : (
          <View style={{ paddingTop: spacing.xxl }}>
            <AppText center color={colors.textMuted}>
              No products in this category yet
            </AppText>
          </View>
        )}
      </ScrollView>
    </>
  );
}

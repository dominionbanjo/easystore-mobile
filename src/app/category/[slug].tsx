import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ProductGrid } from '@/components/shared/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useGetProductsByCategoryQuery } from '@/api/productApi';
import { useGetCategoryByIdentifierQuery } from '@/api/categoryApi';
import type { IProduct } from '@/types/product';

const PAGE_SIZE = 20;

export default function CategoryScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const params = useLocalSearchParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<IProduct[]>([]);

  const { data: category } = useGetCategoryByIdentifierQuery(params.slug);
  const { data, isLoading, isFetching } = useGetProductsByCategoryQuery({
    identifier: params.slug,
    page,
    limit: PAGE_SIZE,
  });

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [params.slug]);

  useEffect(() => {
    if (!data?.items) {
      return;
    }
    setItems((current) => {
      if (page === 1) {
        return data.items;
      }
      const existing = new Set(current.map((product) => product.id));
      return [...current, ...data.items.filter((product) => !existing.has(product.id))];
    });
  }, [data, page]);

  const title = category?.name ?? params.slug.replace(/-/g, ' ');
  const loadingMore = page > 1 && isFetching;

  return (
    <>
      <Stack.Screen options={{ title, headerShown: true }} />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg }}>
        <Row style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
          <AppText style={{ fontSize: 20, letterSpacing: -0.4 }} weight="black">
            {title}
          </AppText>
          {typeof category?.products_count === 'number' ? (
            <View
              style={{
                backgroundColor: colors.surfaceAlt,
                paddingHorizontal: spacing.sm,
                paddingVertical: 4,
                borderRadius: radius.sm,
              }}
            >
              <AppText variant="small" color={colors.textMuted}>
                {category.products_count} Products
              </AppText>
            </View>
          ) : null}
        </Row>
        {isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : items.length > 0 ? (
          <>
            <ProductGrid products={items} />
            {data?.pagination.hasNext ? (
              <View style={{ marginTop: spacing.md }}>
                <Button
                  title="Load more"
                  variant="outline"
                  onPress={() => setPage((current) => current + 1)}
                  loading={loadingMore}
                />
              </View>
            ) : null}
          </>
        ) : (
          <EmptyState
            title="No products in this category yet"
            description="Check back soon for new items"
          />
        )}
      </ScrollView>
    </>
  );
}

import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { MapPin, Star } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { AppImage } from '@/components/shared/AppImage';
import { ProductGrid } from '@/components/shared/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useGetStoreByIdentifierQuery } from '@/api/storeApi';
import { useGetStoreProductsQuery } from '@/api/productApi';
import type { IProduct } from '@/types/product';

const PAGE_SIZE = 20;

export default function StoreScreen() {
  const { colors, spacing } = useAppTheme();
  const params = useLocalSearchParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<IProduct[]>([]);

  const { data, isLoading: storeLoading } = useGetStoreByIdentifierQuery(params.slug);
  const { data: productsData, isLoading: productsLoading, isFetching } = useGetStoreProductsQuery({
    storeId: params.slug,
    page,
    limit: PAGE_SIZE,
  });

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [params.slug]);

  useEffect(() => {
    if (!productsData?.items) {
      return;
    }
    setItems((current) => {
      if (page === 1) {
        return productsData.items;
      }
      const existing = new Set(current.map((product) => product.id));
      return [...current, ...productsData.items.filter((product) => !existing.has(product.id))];
    });
  }, [productsData, page]);

  const store = data?.store;

  if (storeLoading || (store && productsLoading)) {
    return (
      <View style={{ padding: spacing.lg }}>
        <ProductGridSkeleton count={4} />
      </View>
    );
  }

  if (!store) {
    return (
      <View style={{ padding: spacing.xl }}>
        <AppText center color={colors.textMuted}>
          Store not found
        </AppText>
      </View>
    );
  }

  const rating = Number(store.rating_average ?? 0);
  const loadingMore = page > 1 && isFetching;

  return (
    <>
      <Stack.Screen options={{ title: store.store_name, headerShown: true }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <AppImage
            uri={store.cover_image ?? store.logo}
            style={{ width: '100%', height: 140 }}
            fallbackText={store.store_name}
          />
          <Row style={{ gap: spacing.md, alignItems: 'flex-end' }}>
            <AppImage
              uri={store.logo}
              style={{ width: 64, height: 64, borderRadius: 32, marginTop: -32 }}
              fallbackText={store.store_name[0]}
            />
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle" weight="bold">
                {store.store_name}
              </AppText>
              <AppText variant="caption" color={colors.textMuted} numberOfLines={2}>
                {store.description}
              </AppText>
            </View>
          </Row>
          {rating > 0 ? (
            <Row style={{ gap: spacing.xs }}>
              <Star size={14} color={colors.warning} fill={colors.warning} />
              <AppText variant="small" weight="semibold">
                {rating.toFixed(1)}
              </AppText>
            </Row>
          ) : null}
          {store.address_state ? (
            <Row style={{ gap: spacing.xs }}>
              <MapPin size={14} color={colors.textSubtle} />
              <AppText variant="small" color={colors.textSubtle}>
                {store.address_state}
              </AppText>
            </Row>
          ) : null}
          <Spacer height={8} />
          <AppText variant="label" weight="semibold">
            Products
          </AppText>
          {items.length > 0 ? (
            <>
              <ProductGrid products={items} />
              {productsData?.pagination.hasNext ? (
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
          ) : productsLoading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <EmptyState
              title="No products yet"
              description="Check back soon"
            />
          )}
        </View>
      </ScrollView>
    </>
  );
}

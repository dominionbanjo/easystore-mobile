import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { useAppTheme } from '@/theme';
import { AppText } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ProductGrid } from '@/components/shared/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  useGetFeaturedProductsQuery,
  useGetProductsQuery,
  useSearchProductsQuery,
} from '@/api/productApi';
import { useGetTrendingStoresQuery } from '@/api/storeApi';
import { useGetZonesQuery } from '@/api/zoneApi';
import { AppImage } from '@/components/shared/AppImage';
import { Card } from '@/components/ui/Card';
import type { IProduct } from '@/types/product';

const PAGE_SIZE = 20;

export default function ProductsListScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; q?: string }>();
  const query = params.q ?? '';
  const mode = query ? 'search' : params.mode ?? 'new';

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<IProduct[]>([]);

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [mode, query]);

  const featured = useGetFeaturedProductsQuery(undefined, { skip: mode !== 'featured' });
  const deals = useSearchProductsQuery(
    { onSale: true, limit: PAGE_SIZE, sort: 'date_desc', page },
    { skip: mode !== 'deals' },
  );
  const trending = useSearchProductsQuery(
    { sort: 'rating_desc', limit: PAGE_SIZE, page },
    { skip: mode !== 'trending' },
  );
  const search = useSearchProductsQuery(
    { q: query, sort: 'relevance', limit: PAGE_SIZE, page },
    { skip: mode !== 'search' },
  );
  const newArrivals = useGetProductsQuery({ limit: PAGE_SIZE, page }, { skip: mode !== 'new' });
  const stores = useGetTrendingStoresQuery({ limit: PAGE_SIZE }, { skip: mode !== 'stores' });
  const zones = useGetZonesQuery({ limit: PAGE_SIZE }, { skip: mode !== 'zones' });

  const active =
    mode === 'search'
      ? search
      : mode === 'deals'
        ? deals
        : mode === 'trending'
          ? trending
          : newArrivals;

  useEffect(() => {
    const result = active.data?.items;
    if (!result) {
      return;
    }
    setItems((current) => {
      if (page === 1) {
        return result;
      }
      const existing = new Set(current.map((product) => product.id));
      return [...current, ...result.filter((product) => !existing.has(product.id))];
    });
  }, [active.data, page]);

  const titles: Record<string, string> = {
    search: 'Search Results',
    featured: 'Featured Products',
    deals: 'Deals of the Day',
    trending: 'Trending Now',
    new: 'New Arrivals',
    stores: 'Top Stores',
    zones: 'School Zones',
  };

  const isLoading =
    (mode === 'featured' && featured.isLoading) ||
    (mode === 'deals' && deals.isLoading) ||
    (mode === 'trending' && trending.isLoading) ||
    (mode === 'search' && search.isLoading) ||
    (mode === 'new' && newArrivals.isLoading) ||
    (mode === 'stores' && stores.isLoading) ||
    (mode === 'zones' && zones.isLoading);

  const loadingMore = page > 1 && active.isFetching;
  const canLoadMore =
    mode !== 'stores' && mode !== 'zones' && mode !== 'featured'
      ? Boolean(active.data?.pagination.hasNext)
      : false;
  const gridProducts = mode === 'featured' ? (featured.data ?? []) : items;

  return (
    <>
      <Stack.Screen options={{ title: titles[mode] ?? 'Products', headerShown: true }} />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg }}>
        {isLoading ? (
          <ProductGridSkeleton count={6} />
        ) : mode === 'stores' ? (
          stores.data && stores.data.items.length > 0 ? (
            <View style={{ gap: spacing.md }}>
              {stores.data.items.map((store) => (
                <Card
                  key={store.id}
                  onPress={() => router.push({ pathname: '/store/[slug]', params: { slug: store.slug } })}
                  style={{ gap: spacing.md }}
                >
                  <View style={{ flexDirection: 'row', gap: spacing.md }}>
                    <AppImage
                      uri={store.logo}
                      style={{ width: 72, height: 72 }}
                      fallbackText={store.store_name}
                    />
                    <View style={{ flex: 1, gap: 4 }}>
                      <AppText variant="label" weight="bold">
                        {store.store_name}
                      </AppText>
                      <AppText variant="small" color={colors.textMuted} numberOfLines={2}>
                        {store.description}
                      </AppText>
                      <AppText variant="small" color={colors.textSubtle}>
                        {store.total_products ?? 0} products
                      </AppText>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          ) : null
        ) : mode === 'zones' ? (
          zones.data && zones.data.items.length > 0 ? (
            <View style={{ gap: spacing.md }}>
              {zones.data.items.map((zone) => (
                <Card
                  key={zone.id}
                  onPress={() =>
                    router.push({ pathname: '/zone/[identifier]', params: { identifier: zone.slug ?? zone.id } })
                  }
                  style={{ gap: spacing.md }}
                >
                  <View style={{ flexDirection: 'row', gap: spacing.md }}>
                    <AppImage
                      uri={zone.logo}
                      style={{ width: 72, height: 72 }}
                      fallbackText={zone.name}
                    />
                    <View style={{ flex: 1, gap: 4 }}>
                      <AppText variant="label" weight="bold">
                        {zone.name}
                      </AppText>
                      <AppText variant="small" color={colors.textMuted} numberOfLines={2}>
                        {zone.tagline ?? zone.description}
                      </AppText>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          ) : null
        ) : gridProducts.length > 0 ? (
          <>
            <ProductGrid products={gridProducts} />
            {canLoadMore ? (
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
            title={mode === 'search' ? 'No results found' : 'No products found'}
            description={mode === 'search' ? 'Try a different search term' : 'Try a different category'}
          />
        )}
      </ScrollView>
    </>
  );
}

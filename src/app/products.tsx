import { ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { useAppTheme } from '@/theme';
import { AppText } from '@/components/ui/Text';
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

export default function ProductsListScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode ?? 'new';

  const featured = useGetFeaturedProductsQuery(undefined, { skip: mode !== 'featured' });
  const deals = useSearchProductsQuery({ onSale: true, limit: 20, sort: 'date_desc' }, {
    skip: mode !== 'deals',
  });
  const newArrivals = useGetProductsQuery({ limit: 20 }, { skip: mode !== 'new' });
  const stores = useGetTrendingStoresQuery({ limit: 20 }, { skip: mode !== 'stores' });
  const zones = useGetZonesQuery({ limit: 20 }, { skip: mode !== 'zones' });

  const titles: Record<string, string> = {
    featured: 'Featured Products',
    deals: 'Deals of the Day',
    new: 'New Arrivals',
    stores: 'Top Stores',
    zones: 'School Zones',
  };

  const isLoading =
    (mode === 'featured' && featured.isLoading) ||
    (mode === 'deals' && deals.isLoading) ||
    (mode === 'new' && newArrivals.isLoading) ||
    (mode === 'stores' && stores.isLoading) ||
    (mode === 'zones' && zones.isLoading);

  let products;
  if (mode === 'featured') {
    products = featured.data;
  } else if (mode === 'deals') {
    products = deals.data?.items;
  } else {
    products = newArrivals.data?.items;
  }

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
        ) : products && products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState title="No products found" description="Try a different category" />
        )}
      </ScrollView>
    </>
  );
}

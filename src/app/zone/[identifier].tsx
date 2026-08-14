import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { useAppTheme } from '@/theme';
import { AppText, Spacer } from '@/components/ui/Text';
import { AppImage } from '@/components/shared/AppImage';
import { ProductGrid } from '@/components/shared/ProductCard';
import { StoreCard } from '@/components/shared/Cards';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { SegmentedControl } from '@/components/ui/Button';
import {
  useGetZoneByIdentifierQuery,
  useGetZoneProductsQuery,
  useGetZoneStoresQuery,
} from '@/api/zoneApi';
import type { IStore } from '@/types/store';
import type { IZoneStore } from '@/types/zone';

type ZoneTab = 'products' | 'stores';

function toStore(store: IZoneStore): IStore {
  return {
    id: store.id,
    store_name: store.store_name,
    slug: store.slug,
    subdomain: store.subdomain,
    category: store.category,
    description: store.description,
    logo: store.logo,
    cover_image: store.cover_image,
    rating_average: store.rating_average,
    total_products: store.total_products,
    address: store.address
      ? {
          street: null,
          city: store.address.city,
          state: store.address.state,
          country: store.address.country,
          postal_code: null,
        }
      : null,
  };
}

export default function ZoneScreen() {
  const { colors, spacing } = useAppTheme();
  const params = useLocalSearchParams<{ identifier: string }>();
  const [tab, setTab] = useState<ZoneTab>('products');

  const { data: zone, isLoading: zoneLoading } = useGetZoneByIdentifierQuery(params.identifier);
  const { data: productsData, isLoading: productsLoading } = useGetZoneProductsQuery({
    identifier: params.identifier,
    limit: 20,
  });
  const { data: storesData, isLoading: storesLoading } = useGetZoneStoresQuery(params.identifier);

  if (zoneLoading) {
    return (
      <View style={{ padding: spacing.lg }}>
        <ProductGridSkeleton count={4} />
      </View>
    );
  }

  if (!zone) {
    return (
      <View style={{ padding: spacing.xl }}>
        <AppText center color={colors.textMuted}>
          Zone not found
        </AppText>
      </View>
    );
  }

  const products = productsData?.items ?? [];

  return (
    <>
      <Stack.Screen options={{ title: zone.name, headerShown: true }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <AppImage
            uri={zone.cover_image ?? zone.logo}
            style={{ width: '100%', height: 160 }}
            fallbackText={zone.name}
          />
          <View>
            <AppText variant="subtitle" weight="bold">
              {zone.name}
            </AppText>
            {zone.tagline ? (
              <AppText variant="caption" color={colors.textMuted}>
                {zone.tagline}
              </AppText>
            ) : null}
            {zone.description ? (
              <AppText variant="caption" color={colors.textSubtle} style={{ marginTop: 4 }}>
                {zone.description}
              </AppText>
            ) : null}
          </View>
          <Spacer height={8} />
          <SegmentedControl<ZoneTab>
            options={[
              { label: 'Products', value: 'products' },
              { label: 'Stores', value: 'stores' },
            ]}
            value={tab}
            onChange={setTab}
          />
          {tab === 'products' ? (
            productsLoading ? (
              <ProductGridSkeleton count={4} />
            ) : products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <EmptyState
                title="No products in this zone yet"
                description="Check back soon for new items"
              />
            )
          ) : storesLoading ? (
            <ProductGridSkeleton count={4} />
          ) : storesData && storesData.items.length > 0 ? (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                rowGap: spacing.md,
              }}
            >
              {storesData.items.map((store) => (
                <View key={store.id} style={{ width: '48.5%' }}>
                  <StoreCard store={toStore(store)} />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              title="No stores yet"
              description="Vendors will join this zone soon"
            />
          )}
        </View>
      </ScrollView>
    </>
  );
}

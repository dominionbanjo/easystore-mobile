import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/ui/Screen';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { ProductRail } from '@/components/shared/SectionHeader';
import { ProductGrid } from '@/components/shared/ProductCard';
import { AppImage } from '@/components/shared/AppImage';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { useAppTheme } from '@/theme';
import {
  useGetFeaturedProductsQuery,
  useGetProductsQuery,
  useGetProductsByCategoryQuery,
} from '@/api/productApi';
import { useGetTrendingStoresQuery } from '@/api/storeApi';
import { useGetZonesQuery } from '@/api/zoneApi';
import { useGetCategoriesQuery } from '@/api/categoryApi';
import type { IProduct } from '@/types/product';

function ProductRailSection({
  title,
  actionHref,
  products,
  isLoading,
}: {
  title: string;
  actionHref: string;
  products?: IProduct[];
  isLoading: boolean;
}) {
  const router = useRouter();
  if (isLoading) {
    return <ProductGridSkeleton count={4} />;
  }
  if (!products || products.length === 0) {
    return null;
  }
  return (
    <ProductRail
      title={title}
      actionLabel="See all"
      onAction={() => router.push(actionHref as never)}
    >
      <ProductGrid products={products.slice(0, 4)} compact />
    </ProductRail>
  );
}

export default function HomeScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();

  const featured = useGetFeaturedProductsQuery();
  const allProducts = useGetProductsQuery({ limit: 8 });
  const onSale = useGetProductsQuery({ limit: 8 });
  const stores = useGetTrendingStoresQuery({ limit: 5 });
  const zones = useGetZonesQuery({ limit: 5 });
  const categories = useGetCategoriesQuery();

  const topCategories = categories.data?.slice(0, 8) ?? [];
  const topZones = zones.data?.items ?? [];

  return (
    <Screen scroll={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View>
              <AppText variant="display" weight="bold">
                EasyStore
              </AppText>
              <AppText variant="caption" color={colors.textMuted}>
                Shop smarter, pay your way
              </AppText>
            </View>
            <Row style={{ gap: spacing.sm }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.primaryMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="storefront" size={20} color={colors.primary} />
              </View>
            </Row>
          </Row>
          <Spacer height={16} />
          <Row
            style={{
              gap: spacing.sm,
            }}
          >
            <View
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 999,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                backgroundColor: colors.surface,
              }}
            >
              <Row style={{ gap: spacing.sm }}>
                <Ionicons name="search" size={18} color={colors.textSubtle} />
                <AppText variant="caption" color={colors.textSubtle}>
                  Search products, stores…
                </AppText>
              </Row>
            </View>
          </Row>
        </View>

        <View style={{ padding: spacing.lg }}>
          {topCategories.length > 0 ? (
            <ProductRail title="Shop by Category" actionLabel="All" onAction={() => router.push('/products' as never)}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Row style={{ gap: spacing.md }}>
                  {topCategories.map((category) => (
                    <View key={category.id} style={{ alignItems: 'center', gap: spacing.xs, width: 84 }}>
                      <View
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 32,
                          backgroundColor: colors.primaryMuted,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons name="pricetag" size={26} color={colors.primary} />
                      </View>
                      <AppText variant="small" center numberOfLines={1}>
                        {category.name}
                      </AppText>
                    </View>
                  ))}
                </Row>
              </ScrollView>
            </ProductRail>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: spacing.lg }}>
          <ProductRailSection
            title="Featured Products"
            actionHref="/products?mode=featured"
            products={featured.data}
            isLoading={featured.isLoading}
          />
          <Spacer height={16} />
          <ProductRailSection
            title="Deals of the Day"
            actionHref="/products?mode=deals"
            products={onSale.data?.items}
            isLoading={onSale.isLoading}
          />
          <Spacer height={16} />
          <ProductRailSection
            title="New Arrivals"
            actionHref="/products"
            products={allProducts.data?.items}
            isLoading={allProducts.isLoading}
          />

          {stores.data && stores.data.items.length > 0 ? (
            <ProductRail
              title="Top Stores"
              actionLabel="See all"
              onAction={() => router.push('/products?mode=stores' as never)}
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Row style={{ gap: spacing.md }}>
                  {stores.data.items.map((store) => (
                    <View key={store.id} style={{ width: 140, gap: spacing.xs }}>
                      <AppImage
                        uri={store.logo}
                        style={{ width: 140, height: 140, borderRadius: 12 }}
                        fallbackText={store.store_name}
                      />
                      <AppText variant="label" weight="medium" numberOfLines={1}>
                        {store.store_name}
                      </AppText>
                    </View>
                  ))}
                </Row>
              </ScrollView>
            </ProductRail>
          ) : null}

          {topZones.length > 0 ? (
            <ProductRail
              title="School Zones"
              actionLabel="See all"
              onAction={() => router.push('/products?mode=zones' as never)}
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Row style={{ gap: spacing.md }}>
                  {topZones.map((zone) => (
                    <View key={zone.id} style={{ width: 160, gap: spacing.xs }}>
                      <View
                        style={{
                          backgroundColor: colors.primaryMuted,
                          borderRadius: 12,
                          padding: spacing.md,
                          minHeight: 80,
                          justifyContent: 'center',
                        }}
                      >
                        <AppText variant="subtitle" weight="bold" color={colors.primary}>
                          {zone.name}
                        </AppText>
                        <AppText variant="small" color={colors.textMuted} numberOfLines={2}>
                          {zone.tagline ?? zone.description}
                        </AppText>
                      </View>
                    </View>
                  ))}
                </Row>
              </ScrollView>
            </ProductRail>
          ) : null}

          <Spacer height={24} />
          <AppText variant="small" color={colors.textSubtle} center>
            Marketplace for everything you need
          </AppText>
        </View>
      </ScrollView>
    </Screen>
  );
}

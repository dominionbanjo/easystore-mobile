import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { AppImage } from '@/components/shared/AppImage';
import { ProductGrid } from '@/components/shared/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { useGetStoreByIdentifierQuery } from '@/api/storeApi';
import { useGetStoreProductsQuery } from '@/api/productApi';

export default function StoreScreen() {
  const { colors, spacing } = useAppTheme();
  const params = useLocalSearchParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  const { data: store, isLoading: storeLoading } = useGetStoreByIdentifierQuery(params.slug);
  const { data: productsData, isLoading: productsLoading } = useGetStoreProductsQuery({
    storeId: params.slug,
    page,
    limit: 20,
  });

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
          {store.address_state ? (
            <Row style={{ gap: spacing.xs }}>
              <Ionicons name="location-outline" size={14} color={colors.textSubtle} />
              <AppText variant="small" color={colors.textSubtle}>
                {store.address_state}
              </AppText>
            </Row>
          ) : null}
          <Spacer height={8} />
          <AppText variant="label" weight="semibold">
            Products
          </AppText>
          <ProductGrid products={productsData?.items ?? []} />
        </View>
      </ScrollView>
    </>
  );
}

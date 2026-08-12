import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { useAppTheme } from '@/theme';
import { AppText, Spacer } from '@/components/ui/Text';
import { AppImage } from '@/components/shared/AppImage';
import { ProductGrid } from '@/components/shared/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { useGetZoneByIdentifierQuery } from '@/api/zoneApi';
import { useGetZoneProductsQuery } from '@/api/zoneApi';

export default function ZoneScreen() {
  const { colors, spacing } = useAppTheme();
  const params = useLocalSearchParams<{ identifier: string }>();

  const { data: zone, isLoading: zoneLoading } = useGetZoneByIdentifierQuery(params.identifier);
  const { data: productsData, isLoading: productsLoading } = useGetZoneProductsQuery({
    identifier: params.identifier,
    limit: 20,
  });

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
          <AppText variant="label" weight="semibold">
            Products
          </AppText>
          {productsLoading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <ProductGrid products={productsData?.items ?? []} />
          )}
        </View>
      </ScrollView>
    </>
  );
}

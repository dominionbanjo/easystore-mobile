import { useState } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { formatNGN } from '@/utils/money';
import { useGetMyInstallmentsQuery } from '@/api/installmentApi';

export default function InstallmentsScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetMyInstallmentsQuery({ page, limit: 10 });

  return (
    <>
      <Stack.Screen options={{ title: 'My Installments', headerShown: true }} />
      <PaginatedList
        items={data?.items}
        pagination={data?.pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        isLoadingMore={isFetching && page > 1}
        onEndReached={() => setPage((p) => p + 1)}
        onRefresh={() => setPage(1)}
        keyExtractor={(item) => item.id}
        renderItem={(plan) => (
          <Card
            onPress={() => router.push({ pathname: '/installment/[id]', params: { id: plan.id } })}
            style={{ marginHorizontal: 16, marginBottom: 12, gap: spacing.sm }}
          >
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="label" weight="bold">
                {plan.order?.order_items?.[0]?.name ?? `Plan ${plan.id.slice(0, 8)}`}
              </AppText>
              <StatusBadge status={plan.status} />
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" color={colors.textMuted}>
                {plan.installments_paid}/{plan.installments_total} paid
              </AppText>
              <AppText variant="label" weight="semibold" color={colors.primary}>
                {formatNGN(plan.paid_kobo)} / {formatNGN(plan.total_kobo)}
              </AppText>
            </Row>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
              <View
                style={{
                  width: `${plan.total_kobo > 0 ? Math.min(100, (plan.paid_kobo / plan.total_kobo) * 100) : 0}%`,
                  height: '100%',
                  backgroundColor: colors.primary,
                }}
              />
            </View>
          </Card>
        )}
        emptyTitle="No installment plans"
        emptyDescription="Enable installments at checkout on eligible orders"
        ListHeaderComponent={
          <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
            <AppText variant="caption" color={colors.textMuted}>
              Buy now, pay later
            </AppText>
            <Spacer height={8} />
          </View>
        }
      />
    </>
  );
}

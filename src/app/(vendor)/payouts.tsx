import { useState } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Card, Badge } from '@/components/ui/Card';
import type { BadgeVariant } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { formatNGN } from '@/utils/money';
import { useGetVendorPayoutsQuery } from '@/api/storeApi';
import type { IVendorPayout } from '@/types/store';

const PAYOUT_BADGES: Record<string, { label: string; variant: BadgeVariant }> = {
  pending_manual: { label: 'In Review', variant: 'warning' },
  success: { label: 'Paid', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  failed: { label: 'Failed', variant: 'destructive' },
  reversed: { label: 'Reversed', variant: 'destructive' },
};

function PayoutStatusBadge({ payout }: { payout: IVendorPayout }) {
  const mapped = PAYOUT_BADGES[payout.status];
  if (mapped) {
    return <Badge label={mapped.label} variant={mapped.variant} />;
  }
  return <StatusBadge status={payout.status} />;
}

export default function PayoutsScreen() {
  const { colors, isDark, spacing } = useAppTheme();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, refetch } = useGetVendorPayoutsQuery({
    page,
    limit: 20,
  });

  const totalPending =
    data?.items
      .filter((payout) => payout.status === 'pending' || payout.status === 'pending_manual')
      .reduce((sum, payout) => sum + Number(payout.amount), 0) ?? 0;

  if (isError) {
    return (
      <View style={{ padding: spacing.xl, gap: spacing.md, alignItems: 'center' }}>
        <AppText center color={colors.textMuted}>
          Couldn't load payouts
        </AppText>
        <Button title="Try Again" onPress={refetch} fullWidth={false} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <PaginatedList
        items={data?.items}
        pagination={data?.pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        isLoadingMore={isFetching && page > 1}
        onEndReached={() => setPage((p) => p + 1)}
        onRefresh={() => setPage(1)}
        keyExtractor={(item) => item.id}
        renderItem={(payout) => (
          <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="label" weight="bold">
                {formatNGN(payout.amount)}
              </AppText>
              <PayoutStatusBadge payout={payout} />
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" color={colors.textMuted}>
                {payout.payout_type} payout
              </AppText>
              <AppText variant="small" color={colors.textMuted}>
                {payout.transferred_at
                  ? new Date(payout.transferred_at).toLocaleDateString('en-NG')
                  : 'Pending transfer'}
              </AppText>
            </Row>
            {payout.admin_note ? (
              <AppText variant="small" color={colors.textMuted}>
                Note: {payout.admin_note}
              </AppText>
            ) : null}
          </Card>
        )}
        emptyTitle="No payouts yet"
        emptyDescription="Completed orders generate payouts"
        ListHeaderComponent={
          <View style={{ padding: spacing.lg, paddingBottom: 0, gap: spacing.sm }}>
            <Card
              style={{
                backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : '#e6f7ee',
                borderColor: colors.primary,
              }}
            >
              <AppText variant="label" color={colors.textMuted}>
                Pending payout balance
              </AppText>
              <AppText variant="title" weight="bold" color={colors.primary}>
                {formatNGN(totalPending)}
              </AppText>
            </Card>
            {data?.pagination.hasNext ? (
              <AppText variant="small" color={colors.textMuted}>
                Showing first 20 payouts — total may be higher
              </AppText>
            ) : null}
          </View>
        }
      />
    </View>
  );
}

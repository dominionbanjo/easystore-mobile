import { useState } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { formatNGN } from '@/utils/money';
import { useGetVendorPayoutsQuery } from '@/api/storeApi';

export default function PayoutsScreen() {
  const { spacing } = useAppTheme();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetVendorPayoutsQuery({ page, limit: 20 });

  const totalPending =
    data?.items
      .filter((payout) => payout.status === 'pending' || payout.status === 'pending_manual')
      .reduce((sum, payout) => sum + payout.amount, 0) ?? 0;

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
              <StatusBadge status={payout.status} />
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" color="gray">
                {payout.payout_type} payout
              </AppText>
              <AppText variant="small" color="gray">
                {payout.transferred_at
                  ? new Date(payout.transferred_at).toLocaleDateString('en-NG')
                  : 'Pending transfer'}
              </AppText>
            </Row>
            {payout.admin_note ? (
              <AppText variant="small" color="gray">
                Note: {payout.admin_note}
              </AppText>
            ) : null}
          </Card>
        )}
        emptyTitle="No payouts yet"
        emptyDescription="Completed orders generate payouts"
        ListHeaderComponent={
          <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
            <Card style={{ backgroundColor: '#e6f7ee', borderColor: '#17c06e' }}>
              <AppText variant="label" color="gray">
                Pending payout balance
              </AppText>
              <AppText variant="title" weight="bold" color="green">
                {formatNGN(totalPending)}
              </AppText>
            </Card>
          </View>
        }
      />
    </View>
  );
}

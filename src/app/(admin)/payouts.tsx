import { useState } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { ConfirmDialog } from '@/components/ui/Modal';
import { formatNGN } from '@/utils/money';
import {
  useGetAdminEscrowsQuery,
  useGetAdminPayoutsQuery,
  useMarkEscrowTransferredMutation,
} from '@/api/adminApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { IAdminPayout } from '@/types/admin';

export default function AdminPayoutsScreen() {
  const { spacing } = useAppTheme();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const {
    data: escrows,
    isLoading,
    isFetching,
    isError: escrowsError,
    refetch: refetchEscrows,
  } = useGetAdminEscrowsQuery({ page, limit: 20 });
  const {
    data: payouts,
    isError: payoutsError,
    refetch: refetchPayouts,
  } = useGetAdminPayoutsQuery({ page: 1, limit: 20 });

  const [markTransferred, { isLoading: marking }] = useMarkEscrowTransferredMutation();
  const [transferTarget, setTransferTarget] = useState<IAdminPayout | null>(null);

  const isError = escrowsError || payoutsError;

  const handleMarkTransferred = async () => {
    if (!transferTarget) {
      return;
    }
    try {
      await markTransferred(transferTarget.id).unwrap();
      toast.showSuccess('Marked as transferred');
      setTransferTarget(null);
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {payouts && payouts.items.length > 0 && !isError ? (
        <View style={{ padding: spacing.lg, paddingBottom: 0, gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            Payouts
          </AppText>
          {payouts.items.map((payout) => (
            <Card key={payout.id} style={{ gap: 2 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <AppText variant="label" weight="bold">
                  {formatNGN(payout.amount_kobo)}
                </AppText>
                <StatusBadge status={payout.status} />
              </Row>
              <AppText variant="small" color="gray" numberOfLines={1}>
                {payout.vendor_bank?.store_name ?? 'Vendor'} · {payout.payout_type}
              </AppText>
            </Card>
          ))}
        </View>
      ) : null}

      <PaginatedList
        items={escrows?.items}
        pagination={escrows?.pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        error={isError}
        onRetry={() => {
          refetchEscrows();
          refetchPayouts();
        }}
        isLoadingMore={isFetching && page > 1}
        onEndReached={() => setPage((p) => p + 1)}
        onRefresh={() => setPage(1)}
        keyExtractor={(item) => item.id}
        renderItem={(escrow) => (
          <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="label" weight="bold">
                {formatNGN(escrow.amount_kobo)}
              </AppText>
              <StatusBadge status={escrow.status} />
            </Row>
            <AppText variant="small" color="gray" numberOfLines={1}>
              {escrow.vendor_bank?.store_name ?? 'Vendor'} ·{' '}
              {escrow.vendor_bank?.account_name ?? ''}
            </AppText>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" color="gray">
                {escrow.vendor_bank?.bank_name ?? ''}
              </AppText>
              {escrow.status === 'pending_manual' ? (
                <Button
                  title="Mark Transferred"
                  variant="primary"
                  size="sm"
                  fullWidth={false}
                  onPress={() => setTransferTarget(escrow)}
                />
              ) : null}
            </Row>
          </Card>
        )}
        emptyTitle="No payouts found"
        ListHeaderComponent={
          <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
            <AppText variant="label" weight="bold">
              Manual Payout Queue
            </AppText>
            <View style={{ height: 8 }} />
          </View>
        }
      />

      <ConfirmDialog
        visible={Boolean(transferTarget)}
        title="Mark payout as transferred?"
        message={`Confirm transfer of ${formatNGN(transferTarget?.amount_kobo ?? 0)} to the vendor.`}
        loading={marking}
        onConfirm={handleMarkTransferred}
        onCancel={() => setTransferTarget(null)}
      />
    </View>
  );
}

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
import { useGetAdminTransactionsQuery, useFlagTransactionMutation } from '@/api/adminApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { IAdminTransaction } from '@/types/admin';

export default function AdminTransactionsScreen() {
  const { spacing } = useAppTheme();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, refetch } = useGetAdminTransactionsQuery({ page, limit: 20 });
  const [flagTransaction, { isLoading: flagging }] = useFlagTransactionMutation();
  const [flagTarget, setFlagTarget] = useState<IAdminTransaction | null>(null);

  const handleFlag = async () => {
    if (!flagTarget) {
      return;
    }
    try {
      await flagTransaction({ id: flagTarget.id, is_flagged: !flagTarget.is_flagged }).unwrap();
      toast.showSuccess(flagTarget.is_flagged ? 'Unflagged' : 'Flagged');
      setFlagTarget(null);
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <PaginatedList
        items={data?.items}
        pagination={data?.pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        error={isError}
        onRetry={refetch}
        isLoadingMore={isFetching && page > 1}
        onEndReached={() => setPage((p) => p + 1)}
        onRefresh={() => setPage(1)}
        keyExtractor={(item) => item.id}
        renderItem={(transaction) => (
          <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <StatusBadge status={transaction.status} />
              {transaction.is_flagged ? <StatusBadge status="flagged" /> : null}
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="label" weight="medium" numberOfLines={1} style={{ flex: 1 }}>
                {transaction.type.replace(/_/g, ' ')}
              </AppText>
              <AppText variant="label" weight="bold" color="green">
                {formatNGN(transaction.amount)}
              </AppText>
            </Row>
            <AppText variant="small" color="gray" numberOfLines={1}>
              {transaction.description ?? transaction.reference ?? transaction.id}
            </AppText>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" color="gray">
                {new Date(transaction.created_at).toLocaleDateString('en-NG')}
              </AppText>
              <Button
                title={transaction.is_flagged ? 'Unflag' : 'Flag'}
                variant={transaction.is_flagged ? 'primary' : 'outline'}
                size="sm"
                fullWidth={false}
                onPress={() => setFlagTarget(transaction)}
              />
            </Row>
          </Card>
        )}
        emptyTitle="No transactions found"
      />

      <ConfirmDialog
        visible={Boolean(flagTarget)}
        title={flagTarget?.is_flagged ? 'Unflag this transaction?' : 'Flag this transaction for review?'}
        message={
          flagTarget?.is_flagged
            ? 'Remove the review flag from this transaction.'
            : 'This transaction will be marked for manual review.'
        }
        confirmText={flagTarget?.is_flagged ? 'Unflag' : 'Flag'}
        destructive={!flagTarget?.is_flagged}
        loading={flagging}
        onConfirm={handleFlag}
        onCancel={() => setFlagTarget(null)}
      />
    </View>
  );
}

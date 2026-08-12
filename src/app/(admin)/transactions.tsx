import { useState } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { formatNGN } from '@/utils/money';
import { useGetAdminTransactionsQuery, useFlagTransactionMutation } from '@/api/adminApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { IAdminTransaction } from '@/types/admin';

export default function AdminTransactionsScreen() {
  const { spacing } = useAppTheme();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetAdminTransactionsQuery({ page, limit: 20 });
  const [flagTransaction] = useFlagTransactionMutation();

  const handleFlag = async (transaction: IAdminTransaction) => {
    try {
      await flagTransaction({ id: transaction.id, is_flagged: !transaction.is_flagged }).unwrap();
      toast.showSuccess(transaction.is_flagged ? 'Unflagged' : 'Flagged');
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
                onPress={() => handleFlag(transaction)}
              />
            </Row>
          </Card>
        )}
        emptyTitle="No transactions found"
      />
    </View>
  );
}

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
  useGetAdminInstallmentsQuery,
  useForceCompleteInstallmentMutation,
  useForceCancelInstallmentMutation,
} from '@/api/installmentApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { IAdminInstallment } from '@/types/installment';

export default function AdminInstallmentsScreen() {
  const { spacing } = useAppTheme();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, refetch } = useGetAdminInstallmentsQuery({ page });
  const [forceComplete] = useForceCompleteInstallmentMutation();
  const [forceCancel] = useForceCancelInstallmentMutation();
  const [actionTarget, setActionTarget] = useState<{ plan: IAdminInstallment; action: 'complete' | 'cancel' } | null>(null);

  const handleAction = async () => {
    if (!actionTarget) {
      return;
    }
    try {
      if (actionTarget.action === 'complete') {
        await forceComplete(actionTarget.plan.id).unwrap();
        toast.showSuccess('Plan force-completed');
      } else {
        await forceCancel(actionTarget.plan.id).unwrap();
        toast.showSuccess('Plan force-canceled');
      }
      setActionTarget(null);
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  const items = data?.items ?? [];

  return (
    <View style={{ flex: 1 }}>
      <PaginatedList
        items={items}
        pagination={data?.pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        error={isError}
        onRetry={refetch}
        isLoadingMore={isFetching && page > 1}
        onEndReached={() => setPage((p) => p + 1)}
        onRefresh={() => setPage(1)}
        keyExtractor={(item) => item.id}
        renderItem={(plan) => (
          <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="label" weight="bold" numberOfLines={1} style={{ flex: 1 }}>
                {plan.order?.order_items?.[0]?.name ?? `Plan ${plan.id.slice(0, 8)}`}
              </AppText>
              <StatusBadge status={plan.status} />
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" color="gray">
                {plan.installments_paid}/{plan.installments_total} paid · {plan.mode}
              </AppText>
              <AppText variant="small" weight="bold" color="green">
                {formatNGN(plan.paid_kobo)} / {formatNGN(plan.total_kobo)}
              </AppText>
            </Row>
            <Row style={{ gap: 8 }}>
              <Button
                title="Force Complete"
                variant="outline"
                size="sm"
                fullWidth={false}
                onPress={() => setActionTarget({ plan, action: 'complete' })}
              />
              <Button
                title="Force Cancel"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() => setActionTarget({ plan, action: 'cancel' })}
              />
            </Row>
          </Card>
        )}
        emptyTitle="No installment plans"
      />

      <ConfirmDialog
        visible={Boolean(actionTarget)}
        title={actionTarget?.action === 'complete' ? 'Force complete this plan?' : 'Force cancel this plan?'}
        destructive={actionTarget?.action === 'cancel'}
        onConfirm={handleAction}
        onCancel={() => setActionTarget(null)}
      />
    </View>
  );
}

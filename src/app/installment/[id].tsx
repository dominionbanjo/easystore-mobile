import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatNGN } from '@/utils/money';
import {
  useGetInstallmentByIdQuery,
  usePayInstallmentMutation,
  usePayoffInstallmentMutation,
  useCancelInstallmentMutation,
} from '@/api/installmentApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';

export default function InstallmentDetailScreen() {
  const { colors, spacing } = useAppTheme();
  const toast = useToast();
  const params = useLocalSearchParams<{ id: string }>();

  const { data: planData, isLoading, isError, refetch } = useGetInstallmentByIdQuery(params.id);
  const plan = planData?.data;
  const [pay, { isLoading: paying }] = usePayInstallmentMutation();
  const [payoff, { isLoading: payoffing }] = usePayoffInstallmentMutation();
  const [cancel, { isLoading: cancelling }] = useCancelInstallmentMutation();
  const [cancelOpen, setCancelOpen] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
      }
    };
  }, []);

  const handlePayment = async (action: 'pay' | 'payoff') => {
    try {
      const result =
        action === 'pay'
          ? await pay(plan!.id).unwrap()
          : await payoff(plan!.id).unwrap();
      if (result.payment_url) {
        await WebBrowser.openBrowserAsync(result.payment_url);
        toast.showSuccess('Payment initiated');
        refreshTimer.current = setTimeout(() => {
          refetch();
        }, 5000);
      } else {
        toast.showSuccess('Payment completed');
      }
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  const handleCancel = async () => {
    try {
      await cancel(plan!.id).unwrap();
      toast.showSuccess('Plan canceled');
      setCancelOpen(false);
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <View style={{ padding: spacing.lg }}>
        <ListSkeleton count={3} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        <EmptyState
          title="Failed to load plan"
          description="Check your connection and try again"
          actionLabel="Try Again"
          onAction={() => refetch()}
        />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={{ padding: spacing.xl }}>
        <AppText center color={colors.textMuted}>
          Plan not found
        </AppText>
      </View>
    );
  }

  const progress = plan.total_kobo > 0 ? Math.min(100, (plan.paid_kobo / plan.total_kobo) * 100) : 0;

  return (
    <>
      <Stack.Screen options={{ title: 'Installment Plan', headerShown: true }} />
      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
        <Card style={{ gap: spacing.sm }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="label" weight="bold">
              Status
            </AppText>
            <StatusBadge status={plan.status} />
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="label" color={colors.textMuted}>
              Total
            </AppText>
            <AppText variant="label" weight="bold">
              {formatNGN(plan.total_kobo)}
            </AppText>
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="label" color={colors.textMuted}>
              Paid
            </AppText>
            <AppText variant="label" weight="bold" color={colors.primary}>
              {formatNGN(plan.paid_kobo)}
            </AppText>
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="label" color={colors.textMuted}>
              Mode
            </AppText>
            <AppText variant="label" weight="medium">
              {plan.mode}
            </AppText>
          </Row>
          {plan.next_due_date ? (
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="label" color={colors.textMuted}>
                Next due
              </AppText>
              <AppText variant="label" weight="medium">
                {new Date(plan.next_due_date).toLocaleDateString('en-NG')}
              </AppText>
            </Row>
          ) : null}
          <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
            <View style={{ width: `${progress}%`, height: '100%', backgroundColor: colors.primary }} />
          </View>
        </Card>

        {plan.payments && plan.payments.length > 0 ? (
          <Card style={{ gap: spacing.sm }}>
            <AppText variant="label" weight="bold">
              Payment schedule
            </AppText>
            {plan.payments.map((payment) => (
              <Row key={payment.id} style={{ justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <AppText variant="small" weight="medium">
                    Payment {payment.index}
                  </AppText>
                  <AppText variant="small" color={colors.textMuted}>
                    {payment.due_date
                      ? new Date(payment.due_date).toLocaleDateString('en-NG')
                      : 'Due soon'}
                  </AppText>
                </View>
                <AppText variant="small" weight="semibold" style={{ marginLeft: 8 }}>
                  {formatNGN(payment.amount_kobo)}
                </AppText>
              </Row>
            ))}
          </Card>
        ) : null}

        {plan.order?.order_items ? (
          <Card style={{ gap: spacing.sm }}>
            <AppText variant="label" weight="bold">
              Order items
            </AppText>
            {plan.order.order_items.map((item, index) => (
              <Row key={`${item.product_id}-${index}`} style={{ justifyContent: 'space-between' }}>
                <AppText variant="small" numberOfLines={1} style={{ flex: 1 }}>
                  {item.name}
                </AppText>
                <AppText variant="small" weight="medium" style={{ marginLeft: 8 }}>
                  {item.quantity} × {formatNGN(item.price)}
                </AppText>
              </Row>
            ))}
          </Card>
        ) : null}

        {plan.status === 'active' ? (
          <View style={{ gap: spacing.sm }}>
            <Button
              title={`Pay Next Installment (${plan.payments?.find((p) => p.status === 'pending') ? formatNGN(plan.payments.find((p) => p.status === 'pending')!.amount_kobo) : '—'})`}
              onPress={() => handlePayment('pay')}
              loading={paying}
            />
            <Button title="Pay Off Balance" variant="outline" onPress={() => handlePayment('payoff')} loading={payoffing} />
            <Button
              title="Cancel Plan"
              variant="ghost"
              onPress={() => setCancelOpen(true)}
              loading={cancelling}
            />
          </View>
        ) : null}
        <Spacer height={8} />
      </View>

      <ConfirmDialog
        visible={cancelOpen}
        title="Cancel this installment plan?"
        destructive
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelOpen(false)}
      />
    </>
  );
}

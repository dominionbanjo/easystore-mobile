import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { AppText } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useVerifyOrderPaymentMutation } from '@/api/orderApi';

type VerifyStatus = 'checking' | 'success' | 'pending' | 'error';

export default function VerifyPaymentScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ reference?: string; orderId?: string; installment?: string }>();
  const [verifyPayment, { isLoading }] = useVerifyOrderPaymentMutation();
  const [status, setStatus] = useState<VerifyStatus>(
    params.reference ? 'checking' : 'pending',
  );

  const isInstallment = params.installment === 'true' || params.installment === '1';

  const runVerification = useCallback(() => {
    if (!params.reference) {
      return;
    }
    setStatus('checking');
    verifyPayment(params.reference)
      .unwrap()
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [params.reference, verifyPayment]);

  useEffect(() => {
    runVerification();
  }, [runVerification]);

  const title =
    status === 'success'
      ? isInstallment
        ? 'Deposit Received'
        : 'Payment Successful'
      : status === 'error'
        ? 'Payment Verification Failed'
        : isLoading
          ? 'Verifying Payment…'
          : 'Payment Pending';

  const description =
    status === 'success'
      ? isInstallment
        ? 'Your deposit has been received. Your installment plan is being set up.'
        : 'Your order has been confirmed. Track it from your orders.'
      : status === 'error'
        ? 'We could not confirm your payment. Please retry or contact support if the issue persists.'
        : 'We are confirming your payment. This usually takes a few moments.';

  return (
    <>
      <Stack.Screen options={{ title: 'Payment', headerShown: true, headerBackVisible: false }} />
      <View style={{ flex: 1, padding: spacing.lg, justifyContent: 'center', gap: spacing.lg }}>
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: radius.full,
              backgroundColor:
                status === 'success' ? colors.primaryMuted : colors.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {status === 'success' ? (
              <CheckCircle2 size={44} color={colors.primary} strokeWidth={2} />
            ) : status === 'error' ? (
              <AlertCircle size={44} color={colors.danger} strokeWidth={2} />
            ) : (
              <Clock size={44} color={colors.warning} strokeWidth={2} />
            )}
          </View>
          <AppText variant="title" weight="bold" center>
            {title}
          </AppText>
          <AppText variant="caption" color={colors.textMuted} center>
            {description}
          </AppText>
        </View>
        <Card style={{ gap: spacing.sm }}>
          <RowInfo label="Order" value={params.orderId ?? '—'} />
          <RowInfo label="Reference" value={params.reference ?? '—'} />
        </Card>
        <View style={{ gap: spacing.sm }}>
          {status === 'error' ? (
            <>
              <Button title="Retry Verification" onPress={runVerification} loading={isLoading} />
              <Button title="Back to Home" variant="outline" onPress={() => router.replace('/')} />
            </>
          ) : status === 'success' ? (
            <>
              <Button title="View My Orders" onPress={() => router.replace('/orders')} />
              <Button title="Back to Home" variant="outline" onPress={() => router.replace('/')} />
            </>
          ) : (
            <>
              <Button
                title="View My Orders"
                onPress={() => router.replace('/orders')}
                loading={isLoading}
              />
              <Button title="Back to Home" variant="outline" onPress={() => router.replace('/')} />
            </>
          )}
        </View>
      </View>
    </>
  );
}

function RowInfo({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <AppText variant="label" color={colors.textMuted}>
        {label}
      </AppText>
      <AppText variant="label" weight="medium" numberOfLines={1} style={{ flex: 1, marginLeft: 16, textAlign: 'right' }}>
        {value}
      </AppText>
    </View>
  );
}

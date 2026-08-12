import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/theme';
import { AppText } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useVerifyOrderPaymentMutation } from '@/api/orderApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';

export default function VerifyPaymentScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams<{ reference?: string; orderId?: string }>();
  const [verifyPayment, { isLoading }] = useVerifyOrderPaymentMutation();
  const [status, setStatus] = useState<'checking' | 'success' | 'pending'>(
    params.reference ? 'checking' : 'pending',
  );

  useEffect(() => {
    if (params.reference) {
      verifyPayment(params.reference)
        .unwrap()
        .then(() => setStatus('success'))
        .catch((error) => {
          setStatus('pending');
          toast.showError(getErrorMessage(error));
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.reference]);

  return (
    <>
      <Stack.Screen options={{ title: 'Payment', headerShown: true, headerBackVisible: false }} />
      <View style={{ flex: 1, padding: spacing.lg, justifyContent: 'center', gap: spacing.lg }}>
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor:
                status === 'success' ? colors.primaryMuted : colors.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={status === 'success' ? 'checkmark-circle' : 'time-outline'}
              size={44}
              color={status === 'success' ? colors.primary : colors.warning}
            />
          </View>
          <AppText variant="title" weight="bold" center>
            {status === 'success'
              ? 'Payment Successful'
              : isLoading
                ? 'Verifying Payment…'
                : 'Payment Pending'}
          </AppText>
          <AppText variant="caption" color={colors.textMuted} center>
            {status === 'success'
              ? 'Your order has been confirmed. Track it from your orders.'
              : 'We are confirming your payment. This usually takes a few moments.'}
          </AppText>
        </View>
        <Card style={{ gap: spacing.sm }}>
          <RowInfo label="Order" value={params.orderId ?? '—'} />
          <RowInfo label="Reference" value={params.reference ?? '—'} />
        </Card>
        <Button
          title="View My Orders"
          onPress={() => router.replace('/orders')}
          loading={isLoading && status !== 'success'}
        />
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

import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { AppText, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { AppInput } from '@/components/ui/Input';
import { useVerifyOtpMutation, useResendOtpMutation } from '@/api/authApi';
import { getErrorMessage } from '@/utils/error';
import { useToast } from '@/hooks/useToast';
import { useAppTheme } from '@/theme';

export default function VerifyOtpScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email ?? '';
  const [otp, setOtp] = useState('');
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.showError('Enter the 6-digit code sent to your email');
      return;
    }
    try {
      const data = await verifyOtp({ email, otp }).unwrap();
      toast.showSuccess('Email verified!');
      const home =
        data.user.account_type === 'vendor'
          ? '/vendor'
          : data.user.account_type === 'staff'
            ? '/staff'
            : data.user.account_type === 'admin'
              ? '/admin'
              : '/home';
      router.replace(home as never);
    } catch (error) {
      toast.showError(getErrorMessage(error as never));
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp({ email }).unwrap();
      toast.showSuccess('A new code has been sent');
    } catch (error) {
      toast.showError(getErrorMessage(error as never));
    }
  };

  return (
    <Screen keyboard>
      <Spacer height={16} />
      <AppText variant="subtitle" color={colors.textMuted}>
        We sent a 6-digit code to {email || 'your email'}
      </AppText>
      <Spacer height={24} />
      <View style={{ gap: spacing.md }}>
        <AppInput
          value={otp}
          onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
          placeholder="000000"
          keyboardType="number-pad"
          label="Verification code"
          autoCapitalize="none"
        />
        <Button title="Verify Email" onPress={handleVerify} loading={isLoading} />
        <Button
          title={isResending ? 'Sending…' : 'Resend code'}
          variant="ghost"
          onPress={handleResend}
          disabled={isResending}
        />
      </View>
    </Screen>
  );
}

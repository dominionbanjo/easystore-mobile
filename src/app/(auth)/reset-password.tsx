import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { AppText, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { FormInput, FormError } from '@/components/ui/Form';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/utils/validators';
import { useResetPasswordMutation } from '@/api/authApi';
import { getErrorMessage } from '@/utils/error';
import { useToast } from '@/hooks/useToast';
import { useAppTheme } from '@/theme';

export default function ResetPasswordScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams<{ token?: string; email?: string }>();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirm: '' },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      await resetPassword({
        token: params.token ?? '',
        email: params.email ?? '',
        password: values.password,
      }).unwrap();
      toast.showSuccess('Password updated. Sign in with your new password.');
      router.replace('/login');
    } catch (error) {
      toast.showError(getErrorMessage(error as never));
    }
  };

  return (
    <Screen keyboard>
      <Spacer height={16} />
      <AppText variant="subtitle" color={colors.textMuted}>
        Choose a new password for your account.
      </AppText>
      <Spacer height={24} />
      <View style={{ gap: spacing.md }}>
        <FormInput<ResetPasswordFormValues>
          name="password"
          label="New password"
          secureTextEntry
          control={control}
        />
        <FormInput<ResetPasswordFormValues>
          name="confirm"
          label="Confirm password"
          secureTextEntry
          control={control}
        />
        <FormError message={errors.password?.message ?? errors.confirm?.message} />
        <Button title="Update Password" onPress={handleSubmit(onSubmit)} loading={isLoading} />
      </View>
    </Screen>
  );
}

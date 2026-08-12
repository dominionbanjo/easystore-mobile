import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { AppText, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { FormInput, FormError } from '@/components/ui/Form';
import { forgotPasswordSchema } from '@/utils/validators';
import { useForgotPasswordMutation } from '@/api/authApi';
import { getErrorMessage } from '@/utils/error';
import { useToast } from '@/hooks/useToast';
import { useAppTheme } from '@/theme';

interface ForgotPasswordFormValues {
  email: string;
}

export default function ForgotPasswordScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const toast = useToast();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await forgotPassword({ email: values.email }).unwrap();
      toast.showSuccess('Check your email for the reset link');
      router.replace('/login');
    } catch (error) {
      toast.showError(getErrorMessage(error as never));
    }
  };

  return (
    <Screen keyboard>
      <Spacer height={16} />
      <AppText variant="subtitle" color={colors.textMuted}>
        Enter your email and we will send you a password reset link.
      </AppText>
      <Spacer height={24} />
      <View style={{ gap: spacing.md }}>
        <FormInput<ForgotPasswordFormValues>
          name="email"
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          control={control}
        />
        <FormError message={errors.email?.message} />
        <Button title="Send Reset Link" onPress={handleSubmit(onSubmit)} loading={isLoading} />
      </View>
    </Screen>
  );
}

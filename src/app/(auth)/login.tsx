import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { AppText, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { FormInput, FormError } from '@/components/ui/Form';
import { loginSchema, type LoginFormValues } from '@/utils/validators';
import { useLoginMutation } from '@/api/authApi';
import { getErrorMessage } from '@/utils/error';
import { useToast } from '@/hooks/useToast';
import { useAppTheme } from '@/theme';

export default function LoginScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const toast = useToast();
  const [login, { isLoading }] = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const data = await login(values).unwrap();
      if (data.user.must_change_password) {
        router.replace('/forgot-password');
        return;
      }
      if (!data.user.email_verified) {
        router.replace({ pathname: '/verify-otp', params: { email: values.email } });
        return;
      }
      toast.showSuccess(`Welcome back, ${data.user.first_name}!`);
      const home = data.user.account_type === 'vendor' ? '/vendor' : data.user.account_type === 'staff' ? '/staff' : data.user.account_type === 'admin' ? '/admin' : '/home';
      router.replace(home as never);
    } catch (error) {
      toast.showError(getErrorMessage(error as never));
    }
  };

  return (
    <Screen keyboard>
      <Spacer height={spacing.xl} />
      <AppText variant="display" weight="bold">
        EasyStore
      </AppText>
      <AppText variant="subtitle" color={colors.textMuted}>
        Sign in to your account
      </AppText>
      <Spacer height={spacing.xl} />
      <View style={{ gap: spacing.md }}>
        <FormInput<LoginFormValues>
          name="email"
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          control={control}
        />
        <FormInput<LoginFormValues>
          name="password"
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          control={control}
        />
        <FormError message={errors.email?.message ?? errors.password?.message} />
        <Button title="Sign In" onPress={handleSubmit(onSubmit)} loading={isLoading} />
        <View style={{ alignItems: 'flex-end' }}>
          <Link href="/forgot-password" replace>
            <AppText variant="label" weight="semibold" color={colors.primary}>
              Forgot password?
            </AppText>
          </Link>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xs }}>
          <AppText variant="caption" color={colors.textMuted}>
            New to EasyStore?
          </AppText>
          <Link href="/signup" replace>
            <AppText variant="caption" weight="semibold" color={colors.primary}>
              Create an account
            </AppText>
          </Link>
        </View>
      </View>
    </Screen>
  );
}

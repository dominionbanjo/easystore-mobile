import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/ui/Screen';
import { AppText, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { FormInput, FormError } from '@/components/ui/Form';
import { GoogleSignInButton } from '@/components/shared/GoogleSignInButton';
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

  return (
    <Screen keyboard>
      <Spacer height={8} />
      <AppText style={{ fontSize: 34, letterSpacing: -0.5 }} weight="black">
        Welcome Back
      </AppText>
      <AppText style={{ fontSize: 15 }} color={colors.textMuted}>
        Sign in to your account to continue
      </AppText>
      <Spacer height={28} />
      <View style={{ gap: spacing.md }}>
        <FormInput<LoginFormValues>
          name="email"
          label="Email Address"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          icon={<Ionicons name="mail-outline" size={18} color={colors.textSubtle} />}
          control={control}
        />
        <View style={{ gap: 4 }}>
          <FormInput<LoginFormValues>
            name="password"
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            icon={<Ionicons name="lock-closed-outline" size={18} color={colors.textSubtle} />}
            control={control}
          />
          <View style={{ alignItems: 'flex-end' }}>
            <Link href="/forgot-password" replace>
              <AppText style={{ fontSize: 13 }} weight="semibold" color="#17c06e">
                Forgot Password?
              </AppText>
            </Link>
          </View>
        </View>
        <FormError message={errors.email?.message ?? errors.password?.message} />
        <Button title="Sign In" onPress={handleSubmit(onSubmit)} loading={isLoading} size="lg" />
        <Spacer height={8} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <AppText
            style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}
            color={colors.textSubtle}
          >
            or continue with
          </AppText>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>
        <GoogleSignInButton />
        <Spacer height={4} />
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
          <AppText variant="caption" color={colors.textMuted}>
            {"Don't have an account?"}
          </AppText>
          <Link href="/signup" replace>
            <AppText variant="caption" weight="semibold" color="#17c06e">
              Sign up
            </AppText>
          </Link>
        </View>
      </View>
    </Screen>
  );
}

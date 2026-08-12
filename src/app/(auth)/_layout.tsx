import { Stack, Redirect } from 'expo-router';
import { useAppSelector } from '@/hooks';
import { roleHome } from '@/utils/permissions';
import { useAppTheme } from '@/theme';

export default function AuthLayout() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const { colors } = useAppTheme();

  if (isAuthenticated && user) {
    return <Redirect href={roleHome(user.account_type) as never} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
        headerStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Sign In' }} />
      <Stack.Screen name="signup" options={{ title: 'Create Account' }} />
      <Stack.Screen name="verify-otp" options={{ title: 'Verify Email' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Reset Password' }} />
      <Stack.Screen name="reset-password" options={{ title: 'New Password' }} />
    </Stack>
  );
}

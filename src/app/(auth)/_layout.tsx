import { Stack } from 'expo-router';
import { useAppTheme } from '../../theme';
import { LogoIcon } from '../../components/shared/Logo';
import { AppText, Row } from '../../components/ui/Text';

export default function AuthLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, fontFamily: 'Outfit_700Bold' },
        headerStyle: { backgroundColor: colors.background },
        headerTitle: () => (
          <Row style={{ gap: 8 }}>
            <LogoIcon size="sm" />
            <AppText style={{ fontSize: 20, letterSpacing: -1 }} weight="black">
              EAZY
              <AppText style={{ fontSize: 16, letterSpacing: -1, fontWeight: '300' }} color="#17c06e">
                STORE
              </AppText>
            </AppText>
          </Row>
        ),
      }}
    >
      <Stack.Screen name="login" options={{ title: '' }} />
      <Stack.Screen name="signup" options={{ title: '' }} />
      <Stack.Screen name="verify-otp" options={{ title: '' }} />
      <Stack.Screen name="forgot-password" options={{ title: '' }} />
      <Stack.Screen name="reset-password" options={{ title: '' }} />
    </Stack>
  );
}

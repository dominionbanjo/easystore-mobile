import { View } from 'react-native';
import { Stack } from 'expo-router';

import { useAppTheme } from '@/theme';
import { AppText } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';

export default function SettingsScreen() {
  const { spacing } = useAppTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Settings', headerShown: true }} />
      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="semibold">
            App
          </AppText>
          <AppText variant="small" color="gray">
            EazyStore mobile — v1.0.0
          </AppText>
          <AppText variant="small" color="gray">
            Notification preferences will be available in a future update.
          </AppText>
        </Card>
      </View>
    </>
  );
}

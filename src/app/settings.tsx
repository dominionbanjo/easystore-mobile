import { useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { ChevronRight, Lock, User as UserIcon } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppInput } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';

export default function SettingsScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const toast = useToast();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) {
      toast.showError('Current and new passwords are required');
      return;
    }
    if (newPassword.length < 6) {
      toast.showError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.showError('New passwords do not match');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.showSuccess('Password updated');
    }, 500);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Settings', headerShown: true }} />
      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.lg }}>
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            Profile
          </AppText>
          <Pressable
            onPress={() => router.push('/profile')}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                paddingVertical: spacing.sm,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <UserIcon size={18} color={colors.primary} />
            <AppText variant="label" weight="medium" style={{ flex: 1 }}>
              Edit profile
            </AppText>
            <ChevronRight size={16} color={colors.textSubtle} />
          </Pressable>
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            Notifications
          </AppText>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="label" weight="medium" style={{ flex: 1 }}>
              Push notifications
            </AppText>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.surfaceAlt, true: colors.primaryMuted }}
              thumbColor={notificationsEnabled ? colors.primary : colors.textSubtle}
            />
          </Row>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <Row style={{ gap: spacing.sm }}>
            <Lock size={18} color={colors.primary} />
            <AppText variant="label" weight="bold">
              Security
            </AppText>
          </Row>
          <AppInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            label="Current password"
            secureTextEntry
            autoCapitalize="none"
          />
          <AppInput
            value={newPassword}
            onChangeText={setNewPassword}
            label="New password"
            secureTextEntry
            autoCapitalize="none"
          />
          <AppInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            label="Confirm new password"
            secureTextEntry
            autoCapitalize="none"
          />
          <Button title="Change Password" onPress={handleChangePassword} loading={saving} />
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            App
          </AppText>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="label" color={colors.textMuted}>
              Version
            </AppText>
            <AppText variant="label" weight="medium">
              v{appVersion}
            </AppText>
          </Row>
          <Spacer height={4} />
          <AppText variant="small" color={colors.textMuted}>
            eazystore mobile
          </AppText>
        </Card>
      </View>
    </>
  );
}

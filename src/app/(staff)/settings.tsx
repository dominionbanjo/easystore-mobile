import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppInput } from '@/components/ui/Input';
import { AppImage } from '@/components/shared/AppImage';
import {
  useGetStaffMeQuery,
  useUpdateStaffMeMutation,
  useChangeStaffPasswordMutation,
} from '@/api/staffApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';

export default function StaffSettingsScreen() {
  const { colors, radius, spacing } = useAppTheme();
  const toast = useToast();

  const { data: staff } = useGetStaffMeQuery();
  const [updateMe] = useUpdateStaffMeMutation();
  const [changePassword] = useChangeStaffPasswordMutation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const [loadedProfile, setLoadedProfile] = useState<string | null>(null);
  if (staff && loadedProfile !== staff.id) {
    setLoadedProfile(staff.id);
    setFirstName(staff.first_name);
    setLastName(staff.last_name);
    setPhoneNumber(staff.phone_number ?? '');
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateMe({ first_name: firstName, last_name: lastName, phone_number: phoneNumber || undefined }).unwrap();
      toast.showSuccess('Profile updated');
    } catch (error) {
      toast.showError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.showError('Fill in both password fields');
      return;
    }
    setSaving(true);
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword }).unwrap();
      toast.showSuccess('Password changed');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      toast.showError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      showsVerticalScrollIndicator={false}
    >
      <Card style={{ alignItems: 'center', gap: spacing.md }}>
        <AppImage
          uri={staff?.avatar}
          style={{ width: 72, height: 72, borderRadius: radius.full }}
          fallbackText={`${firstName[0] ?? ''}${lastName[0] ?? ''}`}
        />
        <View style={{ alignItems: 'center', gap: 2 }}>
          <AppText variant="subtitle" weight="bold" numberOfLines={1}>
            {firstName} {lastName}
          </AppText>
          <AppText variant="small" color={colors.textMuted} numberOfLines={1}>
            {staff?.email}
          </AppText>
        </View>
      </Card>
      <AppInput label="First name" value={firstName} onChangeText={setFirstName} />
      <AppInput label="Last name" value={lastName} onChangeText={setLastName} />
      <AppInput
        label="Phone number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <Button title="Save Profile" onPress={handleSaveProfile} loading={saving} />
      <Spacer height={8} />
      <AppText variant="label" weight="bold">
        Change Password
      </AppText>
      <AppInput
        label="Current password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
      />
      <AppInput
        label="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <Button title="Change Password" variant="outline" onPress={handleChangePassword} loading={saving} />
    </ScrollView>
  );
}

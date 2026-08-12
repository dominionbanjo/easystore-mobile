import { useState } from 'react';
import { View } from 'react-native';

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
  const { colors, spacing } = useAppTheme();
  const toast = useToast();

  const { data: staff } = useGetStaffMeQuery();
  const [updateMe] = useUpdateStaffMeMutation();
  const [changePassword] = useChangeStaffPasswordMutation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loaded, setLoaded] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  if (staff && !loaded) {
    setFirstName(staff.user.first_name);
    setLastName(staff.user.last_name);
    setPhoneNumber(staff.user.phone_number ?? '');
    setLoaded(true);
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
    <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
      <Card style={{ alignItems: 'center', gap: spacing.md }}>
        <AppImage
          uri={staff?.user.avatar}
          style={{ width: 72, height: 72, borderRadius: 36 }}
          fallbackText={`${firstName[0] ?? ''}${lastName[0] ?? ''}`}
        />
        <View style={{ alignItems: 'center', gap: 2 }}>
          <AppText variant="subtitle" weight="bold">
            {firstName} {lastName}
          </AppText>
          <AppText variant="small" color={colors.textMuted}>
            {staff?.user.email}
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
    </View>
  );
}

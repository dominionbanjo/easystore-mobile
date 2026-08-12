import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { useAppTheme } from '@/theme';
import { AppText, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppImage } from '@/components/shared/AppImage';
import { AppInput } from '@/components/ui/Input';
import { useGetMeQuery, useUpdateMeMutation } from '@/api/userApi';
import { pickImage } from '@/utils/upload';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';

export default function ProfileScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const toast = useToast();

  const { data: profile, isLoading } = useGetMeQuery();
  const [updateMe, { isLoading: saving }] = useUpdateMeMutation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setPhoneNumber(profile.phone_number ?? '');
      setAvatar(profile.avatar ?? null);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      if (phoneNumber) {
        formData.append('phone_number', phoneNumber);
      }
      await updateMe(formData).unwrap();
      toast.showSuccess('Profile updated');
      router.back();
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  const handleAvatarChange = async () => {
    const asset = await pickImage();
    if (!asset) {
      return;
    }
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      const filename = asset.uri.split('/').pop() ?? 'avatar.jpg';
      formData.append('avatar', {
        uri: asset.uri,
        name: filename,
        type: 'image/jpeg',
      } as unknown as Blob);
      const updated = await updateMe(formData).unwrap();
      setAvatar(updated.avatar ?? null);
      toast.showSuccess('Avatar updated');
    } catch (error) {
      toast.showError(getErrorMessage(error));
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Profile', headerShown: true }} />
      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
        {isLoading ? (
          <AppText color={colors.textMuted}>Loading profile…</AppText>
        ) : (
          <>
            <Card style={{ alignItems: 'center', gap: spacing.md }}>
              <AppImage
                uri={avatar ?? undefined}
                style={{ width: 96, height: 96, borderRadius: 48 }}
                fallbackText={`${firstName[0] ?? ''}${lastName[0] ?? ''}`}
              />
              <Button
                title={avatarUploading ? 'Uploading…' : 'Change Photo'}
                variant="ghost"
                size="sm"
                fullWidth={false}
                disabled={avatarUploading}
                onPress={handleAvatarChange}
              />
            </Card>
            <Spacer height={8} />
            <AppInput value={firstName} onChangeText={setFirstName} label="First name" />
            <AppInput value={lastName} onChangeText={setLastName} label="Last name" />
            <AppInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              label="Phone number"
              keyboardType="phone-pad"
            />
            <AppText variant="small" color={colors.textMuted}>
              Email: {profile?.email}
            </AppText>
            <Spacer height={8} />
            <Button title="Save Changes" onPress={handleSave} loading={saving} />
          </>
        )}
      </View>
    </>
  );
}

import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useAppTheme } from '@/theme';
import { AppText, Row } from '../ui/Text';
import { AppImage } from './AppImage';
import { useToast } from '@/hooks/useToast';
import { pickImage, uploadImage } from '@/utils/upload';
import type { ICloudinarySignature } from '@/api/uploadApi';

interface ImageUploadProps {
  value?: { url: string; public_id?: string };
  onChange: (image: { url: string; public_id?: string } | null) => void;
  label?: string;
  getSignature: () => Promise<ICloudinarySignature>;
  aspectRatio?: number;
}

export function ImageUpload({
  value,
  onChange,
  label,
  getSignature,
  aspectRatio = 1,
}: ImageUploadProps) {
  const { colors, radius, spacing } = useAppTheme();
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const handlePick = async () => {
    try {
      const asset = await pickImage();
      if (!asset) {
        return;
      }
      setUploading(true);
      const uploaded = await uploadImage(asset.uri, getSignature);
      onChange({ url: uploaded.url, public_id: uploaded.public_id });
      toast.showSuccess('Image uploaded');
    } catch {
      toast.showError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ gap: spacing.sm }}>
      {label ? (
        <AppText variant="label" weight="medium" color={colors.textMuted}>
          {label}
        </AppText>
      ) : null}
      {value?.url ? (
        <View style={{ gap: spacing.sm }}>
          <AppImage uri={value.url} style={{ width: '100%', aspectRatio }} />
          <Row style={{ gap: spacing.md }}>
            <Pressable onPress={handlePick} disabled={uploading}>
              <AppText variant="label" weight="semibold" color={colors.primary}>
                Replace
              </AppText>
            </Pressable>
            <Pressable onPress={() => onChange(null)} disabled={uploading}>
              <AppText variant="label" weight="semibold" color={colors.danger}>
                Remove
              </AppText>
            </Pressable>
          </Row>
        </View>
      ) : (
        <Pressable
          onPress={handlePick}
          disabled={uploading}
          style={{
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.xl,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surfaceAlt,
            minHeight: 120,
          }}
        >
          {uploading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <AppText style={{ fontSize: 28 }} color={colors.textSubtle}>
                +
              </AppText>
              <AppText variant="label" color={colors.textMuted}>
                Tap to add image
              </AppText>
            </>
          )}
        </Pressable>
      )}
    </View>
  );
}

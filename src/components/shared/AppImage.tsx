import { useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { useAppTheme } from '@/theme';
import { AppText } from '../ui/Text';

export function AppImage({
  uri,
  style,
  fallbackText,
  contentFit = 'cover',
}: {
  uri?: string;
  style: object;
  fallbackText?: string;
  contentFit?: 'cover' | 'contain';
}) {
  const { colors, radius } = useAppTheme();
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    return (
      <View
        style={[
          {
            backgroundColor: colors.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.md,
          },
          style,
        ]}
      >
        <AppText variant="small" color={colors.textSubtle} center numberOfLines={2}>
          {fallbackText ?? 'No image'}
        </AppText>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[{ backgroundColor: colors.surfaceAlt, borderRadius: radius.md }, style]}
      contentFit={contentFit}
      transition={150}
      onError={() => setFailed(true)}
      recyclingKey={uri}
    />
  );
}

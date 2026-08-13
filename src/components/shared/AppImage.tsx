import { useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { useAppTheme } from '../../theme';
import { AppText } from '../ui/Text';

type ImageUri = string | { url?: string } | null | undefined;

function resolveUri(uri: ImageUri): string | undefined {
  if (typeof uri === 'string') {
    return uri;
  }
  if (uri && typeof uri === 'object' && typeof uri.url === 'string') {
    return uri.url;
  }
  return undefined;
}

export function AppImage({
  uri,
  style,
  fallbackText,
  contentFit = 'cover',
}: {
  uri: ImageUri;
  style: object;
  fallbackText?: string;
  contentFit?: 'cover' | 'contain';
}) {
  const { colors, radius } = useAppTheme();
  const [failed, setFailed] = useState(false);
  const resolved = resolveUri(uri);

  if (!resolved || failed) {
    return (
      <View
        style={[
          {
            backgroundColor: colors.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.sm,
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
      source={{ uri: resolved }}
      style={[{ backgroundColor: colors.surfaceAlt, borderRadius: radius.sm }, style]}
      contentFit={contentFit}
      transition={150}
      onError={() => setFailed(true)}
      recyclingKey={resolved}
    />
  );
}

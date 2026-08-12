import { Pressable, View } from 'react-native';
import type { ReactNode } from 'react';
import { useAppTheme } from '@/theme';
import { AppText } from './Text';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

export function Badge({
  label,
  variant = 'default',
  style,
}: {
  label: string;
  variant?: BadgeVariant;
  style?: object;
}) {
  const { colors, radius, spacing } = useAppTheme();
  const palettes: Record<BadgeVariant, { bg: string; fg: string }> = {
    default: { bg: colors.primaryMuted, fg: colors.primary },
    success: { bg: colors.primaryMuted, fg: colors.success },
    warning: { bg: '#fef3c7', fg: '#b45309' },
    danger: { bg: '#fee2e2', fg: '#b91c1c' },
    info: { bg: '#dbeafe', fg: '#1d4ed8' },
    muted: { bg: colors.surfaceAlt, fg: colors.textMuted },
  };
  const palette = palettes[variant];
  return (
    <View
      style={[
        {
          paddingHorizontal: spacing.sm,
          paddingVertical: 3,
          borderRadius: radius.full,
          backgroundColor: palette.bg,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <AppText variant="small" weight="medium" color={palette.fg}>
        {label}
      </AppText>
    </View>
  );
}

export function Card({
  children,
  style,
  padded = true,
  onPress,
}: {
  children: ReactNode;
  style?: object;
  padded?: boolean;
  onPress?: () => void;
}) {
  const { colors, radius } = useAppTheme();
  const inner = (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
        },
        padded && { padding: 16 },
        style,
      ]}
    >
      {children}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

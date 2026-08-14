import { Pressable, View } from 'react-native';
import type { ReactNode } from 'react';
import { useAppTheme } from '../../theme';
import { AppText } from './Text';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'muted';

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
  const isDark = useAppTheme().isDark;
  const palettes: Record<BadgeVariant, { bg: string; fg: string; border?: string }> = {
    default: { bg: colors.primary, fg: '#ffffff' },
    secondary: { bg: isDark ? 'rgba(255,255,255,0.06)' : '#f4f4f5', fg: isDark ? '#ffffff' : '#18181b' },
    destructive: { bg: '#f43f5e', fg: '#ffffff' },
    outline: { bg: 'transparent', fg: colors.text, border: colors.border },
    success: { bg: colors.primaryMuted, fg: '#10b981' },
    warning: { bg: '#fef3c7', fg: '#b45309' },
    info: { bg: '#dbeafe', fg: '#1d4ed8' },
    muted: { bg: colors.surfaceAlt, fg: colors.textMuted },
  };
  const palette = palettes[variant];
  return (
    <View
      style={[
        {
          paddingHorizontal: spacing.sm,
          paddingVertical: 2,
          borderRadius: radius.sm,
          backgroundColor: palette.bg,
          borderWidth: palette.border ? 1 : 0,
          borderColor: palette.border,
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
          borderRadius: radius.sm,
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

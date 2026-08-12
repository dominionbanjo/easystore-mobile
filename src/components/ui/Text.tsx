import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useAppTheme } from '@/theme';

interface AppTextProps {
  children: ReactNode;
  variant?: 'title' | 'subtitle' | 'body' | 'label' | 'caption' | 'small' | 'display';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: string;
  style?: object;
  numberOfLines?: number;
  center?: boolean;
}

export function AppText({
  children,
  variant = 'body',
  weight = 'regular',
  color,
  style,
  numberOfLines,
  center,
}: AppTextProps) {
  const { colors, typography } = useAppTheme();
  const baseStyle: Record<string, number | string> = {
    title: { fontSize: typography.xl, fontWeight: '700' as const },
    subtitle: { fontSize: typography.lg, fontWeight: '600' as const },
    body: { fontSize: typography.md, fontWeight: '400' as const },
    label: { fontSize: typography.sm, fontWeight: '500' as const },
    caption: { fontSize: typography.sm, fontWeight: '400' as const },
    small: { fontSize: typography.xs, fontWeight: '400' as const },
    display: { fontSize: typography.display, fontWeight: '700' as const },
  }[variant];

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        baseStyle,
        { color: color ?? colors.text },
        weight === 'bold' && { fontWeight: '700' },
        weight === 'semibold' && { fontWeight: '600' },
        weight === 'medium' && { fontWeight: '500' },
        center && { textAlign: 'center' },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Row({
  children,
  gap = 8,
  style,
}: {
  children: ReactNode;
  gap?: number;
  style?: object;
}) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>
      {children}
    </View>
  );
}

export function Spacer({ height = 8 }: { height?: number }) {
  return <View style={{ height }} />;
}

export function Divider({ color }: { color?: string }) {
  const { colors } = useAppTheme();
  return <View style={{ height: 1, backgroundColor: color ?? colors.border }} />;
}

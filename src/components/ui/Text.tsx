import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useAppTheme } from '../../theme';

interface AppTextProps {
  children: ReactNode;
  variant?: 'title' | 'subtitle' | 'body' | 'label' | 'caption' | 'small' | 'display';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black' | 'light';
  color?: string;
  style?: object;
  numberOfLines?: number;
  center?: boolean;
}

const WEIGHT_FONT: Record<string, string> = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
  extrabold: 'Outfit_800ExtraBold',
  black: 'Outfit_900Black',
  light: 'Outfit_300Light',
};

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
  const baseStyle = ({
    title: { fontSize: typography.xl, fontFamily: 'Outfit_700Bold' },
    subtitle: { fontSize: typography.lg, fontFamily: 'Outfit_600SemiBold' },
    body: { fontSize: typography.md, fontFamily: 'Outfit_400Regular' },
    label: { fontSize: typography.sm, fontFamily: 'Outfit_500Medium' },
    caption: { fontSize: typography.sm, fontFamily: 'Outfit_400Regular' },
    small: { fontSize: typography.xs, fontFamily: 'Outfit_400Regular' },
    display: { fontSize: typography.display, fontFamily: 'Outfit_900Black' },
  } as Record<string, { fontSize: number; fontFamily: string }>)[variant];

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        baseStyle,
        { color: color ?? colors.text },
        weight !== 'regular' && { fontFamily: WEIGHT_FONT[weight] },
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

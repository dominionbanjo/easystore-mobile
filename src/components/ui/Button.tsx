import { ActivityIndicator, Pressable, View } from 'react-native';
import type { ReactNode } from 'react';
import { useAppTheme } from '../../theme';
import { AppText } from './Text';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  style?: object;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
}: ButtonProps) {
  const { radius, spacing } = useAppTheme();
  const isDark = useAppTheme().isDark;

  const backgrounds: Record<string, string> = {
    primary: '#17c06e',
    secondary: isDark ? 'rgba(255,255,255,0.06)' : '#f4f4f5',
    outline: 'transparent',
    ghost: 'transparent',
    danger: '#f43f5e',
    link: 'transparent',
  };

  const textColors: Record<string, string> = {
    primary: '#ffffff',
    secondary: isDark ? '#ffffff' : '#18181b',
    outline: isDark ? '#ffffff' : '#18181b',
    ghost: '#17c06e',
    danger: '#ffffff',
    link: '#17c06e',
  };

  const borders: Record<string, string> = {
    primary: 'transparent',
    secondary: 'transparent',
    outline: isDark ? 'rgba(255,255,255,0.1)' : '#e4e4e7',
    ghost: 'transparent',
    danger: 'transparent',
    link: 'transparent',
  };

  const heights: Record<string, number> = {
    sm: 36,
    md: 44,
    lg: 48,
  };

  const paddings: Record<string, number> = {
    sm: 12,
    md: 24,
    lg: 32,
  };

  const fontSizes: Record<string, number> = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          height: heights[size],
          borderRadius: radius.sm,
          backgroundColor: backgrounds[variant],
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: borders[variant],
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: spacing.sm,
          paddingHorizontal: paddings[size],
          opacity: isDisabled ? 0.5 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <>
          {icon}
          <AppText
            style={{ fontSize: fontSizes[size] }}
            weight={variant === 'primary' ? 'bold' : 'semibold'}
            color={textColors[variant]}
          >
            {title}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  onPress,
  icon,
  disabled = false,
  style,
  accessibilityLabel,
}: {
  onPress?: () => void;
  icon: ReactNode;
  disabled?: boolean;
  style?: object;
  accessibilityLabel?: string;
}) {
  const { colors, radius } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        {
          width: 40,
          height: 40,
          borderRadius: radius.sm,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surfaceAlt,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
}

export function Chip({
  label,
  selected = false,
  onPress,
  style,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: object;
}) {
  const { colors, radius, spacing } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: radius.full,
          backgroundColor: selected ? '#17c06e' : colors.surfaceAlt,
          borderWidth: 1,
          borderColor: selected ? '#17c06e' : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <AppText
        variant="label"
        weight="medium"
        color={selected ? '#ffffff' : colors.textMuted}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  style?: object;
}) {
  const { colors, radius, spacing } = useAppTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: colors.surfaceAlt,
          borderRadius: radius.sm,
          padding: spacing.xs,
          gap: spacing.xs,
        },
        style,
      ]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={{
              flex: 1,
              paddingVertical: spacing.sm,
              borderRadius: radius.sm,
              backgroundColor: selected ? colors.surface : 'transparent',
              alignItems: 'center',
            }}
          >
            <AppText
              variant="label"
              weight={selected ? 'semibold' : 'regular'}
              color={selected ? '#17c06e' : colors.textMuted}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

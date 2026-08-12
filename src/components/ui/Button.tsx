import { ActivityIndicator, Pressable, View } from 'react-native';
import type { ReactNode } from 'react';
import { useAppTheme } from '@/theme';
import { AppText } from './Text';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
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
  const { colors, radius, spacing, typography } = useAppTheme();

  const backgrounds: Record<string, string> = {
    primary: colors.primary,
    secondary: colors.primaryMuted,
    outline: 'transparent',
    ghost: 'transparent',
    danger: colors.danger,
  };

  const textColors: Record<string, string> = {
    primary: colors.primaryForeground,
    secondary: colors.primary,
    outline: colors.primary,
    ghost: colors.primary,
    danger: '#ffffff',
  };

  const heights: Record<string, number> = {
    sm: 36,
    md: 44,
    lg: 52,
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          height: heights[size],
          borderRadius: radius.md,
          backgroundColor: backgrounds[variant],
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: spacing.sm,
          paddingHorizontal: spacing.lg,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          width: fullWidth ? '100%' : undefined,
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
            style={{ fontSize: size === 'lg' ? typography.lg : typography.md }}
            weight="semibold"
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
          borderRadius: radius.md,
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
          backgroundColor: selected ? colors.primary : colors.surface,
          borderWidth: 1,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <AppText
        variant="label"
        weight="medium"
        color={selected ? colors.primaryForeground : colors.textMuted}
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
          borderRadius: radius.md,
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
              color={selected ? colors.primary : colors.textMuted}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

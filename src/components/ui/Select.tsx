import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useAppTheme } from '@/theme';
import { AppText } from './Text';
import { AppModal } from './Modal';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
}: SelectProps) {
  const { colors, radius, spacing } = useAppTheme();
  const selected = options.find((option) => option.value === value);

  const [open, setOpen] = useState(false);

  return (
    <View style={{ gap: spacing.xs }}>
      {label ? (
        <AppText variant="label" weight="medium" color={colors.textMuted}>
          {label}
        </AppText>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        style={{
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: radius.md,
          backgroundColor: disabled ? colors.surfaceAlt : colors.surface,
          minHeight: 48,
          justifyContent: 'center',
          paddingHorizontal: spacing.md,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <AppText color={selected ? colors.text : colors.textSubtle}>
          {selected ? selected.label : placeholder}
        </AppText>
      </Pressable>
      {error ? (
        <AppText variant="small" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
      <AppModal
        visible={open}
        onClose={() => setOpen(false)}
        title={label ?? 'Select an option'}
        scrollable
      >
        <View style={{ gap: spacing.xs }}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={{
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.md,
                  borderRadius: radius.sm,
                  backgroundColor: isSelected ? colors.primaryMuted : colors.surfaceAlt,
                }}
              >
                <AppText
                  weight={isSelected ? 'semibold' : 'regular'}
                  color={isSelected ? colors.primary : colors.text}
                >
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </AppModal>
    </View>
  );
}

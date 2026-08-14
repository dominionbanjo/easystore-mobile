import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { AppText } from './Text';
import { AppModal } from './Modal';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
}

export function FilterDropdown({ label, value, onChange, options }: FilterDropdownProps) {
  const { colors, radius, spacing } = useAppTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={{ flexShrink: 0 }}>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
          minHeight: 44,
          paddingHorizontal: spacing.md,
        }}
      >
        <AppText
          variant="label"
          weight="medium"
          numberOfLines={1}
          style={{ flex: 1 }}
          color={selected ? colors.text : colors.textSubtle}
        >
          {label}: {selected?.label ?? 'All'}
        </AppText>
        <ChevronDown size={16} color={colors.textSubtle} />
      </Pressable>
      <AppModal
        visible={open}
        onClose={() => setOpen(false)}
        title={`Filter by ${label.toLowerCase()}`}
        scrollable
        sheet
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
                  numberOfLines={1}
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

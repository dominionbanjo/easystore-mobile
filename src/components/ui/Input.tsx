import { TextInput, View } from 'react-native';
import type { ReactNode } from 'react';
import { useAppTheme } from '../../theme';
import { AppText } from './Text';

interface AppInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad' | 'numeric' | 'decimal-pad';
  multiline?: boolean;
  numberOfLines?: number;
  icon?: ReactNode;
  rightElement?: ReactNode;
  editable?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  size?: 'sm' | 'md';
  onSubmitEditing?: () => void;
  returnKeyType?: 'default' | 'go' | 'done' | 'search' | 'next' | 'send';
  style?: object;
  backgroundColor?: string;
}

export function AppInput({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  icon,
  rightElement,
  editable = true,
  autoCapitalize = 'sentences',
  maxLength,
  size = 'md',
  onSubmitEditing,
  returnKeyType,
  style,
  backgroundColor,
}: AppInputProps) {
  const { colors, radius, spacing, typography } = useAppTheme();

  const height = size === 'md' ? 48 : 36;

  return (
    <View style={{ gap: spacing.xs, flex: 1 }}>
      {label ? (
        <AppText variant="label" weight="medium" color={colors.textMuted} style={{ fontSize: 15 }}>
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: multiline ? 'flex-start' : 'center',
            borderWidth: 1,
            borderColor: error ? colors.danger : colors.border,
            borderRadius: radius.sm,
            backgroundColor: backgroundColor ?? colors.surfaceAlt,
            paddingHorizontal: size === 'md' ? 12 : 10,
            gap: spacing.sm,
            minHeight: height,
          },
          style,
        ]}
      >
        {icon}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSubtle}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          editable={editable}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          style={{
            flex: 1,
            color: editable ? colors.text : colors.textSubtle,
            fontSize: size === 'md' ? typography.md : 13,
            fontFamily: 'Outfit_400Regular',
            paddingVertical: multiline ? spacing.md : 0,
            textAlignVertical: multiline ? 'top' : 'center',
            minHeight: multiline ? numberOfLines * 20 : undefined,
          }}
        />
        {rightElement}
      </View>
      {error ? (
        <AppText variant="small" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

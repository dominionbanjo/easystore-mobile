import { Controller, useFormContext } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { AppInput } from './Input';
import { Select } from './Select';
import type { SelectOption } from './Select';
import { AppText } from './Text';
import { useAppTheme } from '@/theme';

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  control?: Control<T>;
}

export function FormInput<T extends FieldValues>({
  name,
  label,
  control,
  ...inputProps
}: FormFieldProps<T> & {
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad' | 'numeric' | 'decimal-pad';
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  size?: 'sm' | 'md';
}) {
  const formContext = useFormContext<T>();
  const activeControl = control ?? formContext.control;
  if (!activeControl) {
    return null;
  }
  return (
    <Controller
      control={activeControl}
      name={name}
      render={({ field, fieldState }) => (
        <AppInput
          value={field.value ?? ''}
          onChangeText={field.onChange}
          label={label}
          error={fieldState.error?.message}
          {...inputProps}
        />
      )}
    />
  );
}

export function FormSelect<T extends FieldValues>({
  name,
  label,
  options,
  placeholder,
  control,
}: FormFieldProps<T> & {
  options: SelectOption[];
  placeholder?: string;
}) {
  const formContext = useFormContext<T>();
  const activeControl = control ?? formContext.control;
  if (!activeControl) {
    return null;
  }
  return (
    <Controller
      control={activeControl}
      name={name}
      render={({ field, fieldState }) => (
        <Select
          value={field.value}
          onChange={field.onChange}
          options={options}
          label={label}
          placeholder={placeholder}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

export function FormPriceInput<T extends FieldValues>({
  name,
  label,
  control,
}: FormFieldProps<T>) {
  const formContext = useFormContext<T>();
  const activeControl = control ?? formContext.control;
  if (!activeControl) {
    return null;
  }
  return (
    <Controller
      control={activeControl}
      name={name}
      render={({ field, fieldState }) => {
        const displayValue = field.value === undefined || field.value === null ? '' : String(field.value);
        return (
          <AppInput
            label={label}
            value={displayValue}
            onChangeText={(text) => {
              const digits = text.replace(/[^0-9]/g, '');
              field.onChange(digits === '' ? undefined : Number(digits));
            }}
            keyboardType="number-pad"
            placeholder="0"
            error={fieldState.error?.message}
          />
        );
      }}
    />
  );
}

export function FormError({ message }: { message?: string }) {
  const { colors, spacing } = useAppTheme();
  if (!message) {
    return null;
  }
  return (
    <AppText variant="small" color={colors.danger} style={{ marginTop: spacing.xs }}>
      {message}
    </AppText>
  );
}

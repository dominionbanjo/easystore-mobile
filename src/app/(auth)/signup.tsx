import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { AppText, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { FormInput, FormSelect, FormError } from '@/components/ui/Form';
import { signupSchema, type SignupFormValues } from '@/utils/validators';
import { useRegisterMutation } from '@/api/authApi';
import { getErrorMessage } from '@/utils/error';
import { useToast } from '@/hooks/useToast';
import { useAppTheme } from '@/theme';

export default function SignupScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const toast = useToast();
  const [register, { isLoading }] = useRegisterMutation();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      password: '',
      account_type: 'user',
      store_name: '',
      description: '',
      agree_to_terms: true,
    },
  });

  const accountType = watch('account_type');

  const onSubmit = async (values: SignupFormValues) => {
    try {
      await register({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
        phone_number: values.phone_number || undefined,
        account_type: values.account_type,
        store_name: values.account_type === 'vendor' ? values.store_name : undefined,
        description: values.description || undefined,
        agree_to_terms: true,
      }).unwrap();
      router.replace({ pathname: '/verify-otp', params: { email: values.email } });
    } catch (error) {
      toast.showError(getErrorMessage(error as never));
    }
  };

  return (
    <Screen keyboard>
      <Spacer height={16} />
      <AppText variant="subtitle" color={colors.textMuted}>
        Create your EasyStore account
      </AppText>
      <Spacer height={16} />
      <View style={{ gap: spacing.md }}>
        <FormSelect<SignupFormValues>
          name="account_type"
          label="I want to"
          control={control}
          options={[
            { label: 'Shop on EasyStore', value: 'user' },
            { label: 'Sell on EasyStore', value: 'vendor' },
          ]}
        />
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <FormInput<SignupFormValues> name="first_name" label="First name" control={control} />
          </View>
          <View style={{ flex: 1 }}>
            <FormInput<SignupFormValues> name="last_name" label="Last name" control={control} />
          </View>
        </View>
        <FormInput<SignupFormValues>
          name="email"
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          control={control}
        />
        <FormInput<SignupFormValues>
          name="phone_number"
          label="Phone (optional)"
          keyboardType="phone-pad"
          control={control}
        />
        <FormInput<SignupFormValues>
          name="password"
          label="Password"
          secureTextEntry
          control={control}
        />
        {accountType === 'vendor' ? (
          <>
            <FormInput<SignupFormValues>
              name="store_name"
              label="Store name"
              placeholder="What do you want to call your store?"
              control={control}
            />
            <FormInput<SignupFormValues>
              name="description"
              label="Store description (optional)"
              multiline
              numberOfLines={3}
              control={control}
            />
          </>
        ) : null}
        <FormError
          message={
            errors.first_name?.message ??
            errors.last_name?.message ??
            errors.email?.message ??
            errors.password?.message ??
            errors.store_name?.message ??
            errors.agree_to_terms?.message
          }
        />
        <Button title="Create Account" onPress={handleSubmit(onSubmit)} loading={isLoading} />
      </View>
    </Screen>
  );
}

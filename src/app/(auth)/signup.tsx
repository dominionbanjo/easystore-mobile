import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/ui/Screen';
import { AppText, Spacer } from '@/components/ui/Text';
import { Button, SegmentedControl } from '@/components/ui/Button';
import { FormInput, FormSelect, FormError } from '@/components/ui/Form';
import { GoogleSignInButton } from '@/components/shared/GoogleSignInButton';
import { PasswordStrengthMeter } from '@/components/shared/PasswordStrengthMeter';
import { signupSchema, type SignupFormValues } from '@/utils/validators';
import { useRegisterMutation } from '@/api/authApi';
import { useCheckStoreNameQuery } from '@/api/storeApi';
import { getErrorMessage } from '@/utils/error';
import { useToast } from '@/hooks/useToast';
import { useAppTheme } from '@/theme';
import { useDebounce } from '@/hooks/usePagination';

export default function SignupScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const toast = useToast();
  const [register, { isLoading }] = useRegisterMutation();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
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
      current_sales_channel: '',
      agree_to_terms: true,
    },
  });

  const accountType = watch('account_type');
  const storeName = watch('store_name');
  const password = watch('password');
  const agreeToTerms = watch('agree_to_terms');

  const debouncedStoreName = useDebounce(storeName?.trim() ?? '', 500);
  const { data: nameCheck, isFetching: nameChecking } = useCheckStoreNameQuery(debouncedStoreName, {
    skip: accountType !== 'vendor' || debouncedStoreName.length < 2,
  });

  const onSubmit = async (values: SignupFormValues) => {
    if (!values.agree_to_terms) {
      toast.showError('You must accept the terms to continue');
      return;
    }
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
        current_sales_channel: values.current_sales_channel || undefined,
        agree_to_terms: true,
      }).unwrap();
      router.replace({ pathname: '/verify-otp', params: { email: values.email } });
    } catch (error) {
      toast.showError(getErrorMessage(error as never));
    }
  };

  return (
    <Screen keyboard>
      <Spacer height={8} />
      <AppText style={{ fontSize: 30, letterSpacing: -0.5 }} weight="black">
        Create your account
      </AppText>
      <AppText style={{ fontSize: 15 }} color={colors.textMuted}>
        Join EazyStore and start your journey today.
      </AppText>
      <Spacer height={24} />
      <View style={{ gap: spacing.md }}>
        <SegmentedControl<'user' | 'vendor'>
          value={accountType}
          onChange={(value) => setValue('account_type', value)}
          options={[
            { label: 'I want to buy', value: 'user' },
            { label: 'I want to sell', value: 'vendor' },
          ]}
          style={{ marginBottom: spacing.xs }}
        />
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <FormInput<SignupFormValues>
              name="first_name"
              label="First Name"
              placeholder="e.g. John"
              control={control}
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormInput<SignupFormValues>
              name="last_name"
              label="Last Name"
              placeholder="e.g. Doe"
              control={control}
            />
          </View>
        </View>
        <FormInput<SignupFormValues>
          name="email"
          label="Email"
          placeholder="example@mail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          control={control}
        />
        <FormInput<SignupFormValues>
          name="phone_number"
          label="Phone Number"
          placeholder="080 1234 5678"
          keyboardType="phone-pad"
          control={control}
        />
        <View style={{ gap: 6 }}>
          <FormInput<SignupFormValues>
            name="password"
            label="Password"
            placeholder="Create a strong password"
            secureTextEntry
            control={control}
          />
          <PasswordStrengthMeter password={password ?? ''} />
        </View>

        {accountType === 'vendor' ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 4,
              backgroundColor: colors.surfaceAlt,
              padding: 20,
              gap: spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
              <View style={{ width: 4, height: 24, backgroundColor: '#17c06e' }} />
              <AppText style={{ fontSize: 16 }} weight="bold">
                Store Details
              </AppText>
            </View>
            <FormInput<SignupFormValues>
              name="store_name"
              label="Store Name"
              placeholder="What do you want to call your store?"
              control={control}
            />
            {debouncedStoreName.length >= 2 && nameChecking ? (
              <AppText variant="small" color={colors.textMuted}>
                Checking availability…
              </AppText>
            ) : null}
            {debouncedStoreName.length >= 2 && !nameChecking && nameCheck ? (
              <AppText variant="small" color={nameCheck.available ? '#10b981' : '#ef4444'}>
                {nameCheck.available ? 'Available ✓' : nameCheck.message ?? 'Already taken'}
              </AppText>
            ) : null}
            <FormInput<SignupFormValues>
              name="description"
              label="Store Description"
              placeholder="What do you sell?"
              multiline
              numberOfLines={2}
              control={control}
            />
            <FormSelect<SignupFormValues>
              name="current_sales_channel"
              label="Current Sales Channel"
              placeholder="Select your channel"
              control={control}
              options={[
                { label: 'WhatsApp', value: 'whatsapp' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'TikTok', value: 'tiktok' },
                { label: 'Other', value: 'other' },
              ]}
            />
          </View>
        ) : null}

        <Pressable
          onPress={() => setValue('agree_to_terms', !agreeToTerms as true)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
        >
          <Ionicons
            name={agreeToTerms ? 'checkbox' : 'square-outline'}
            size={20}
            color={agreeToTerms ? '#17c06e' : colors.textSubtle}
          />
          <AppText variant="small" color={colors.textMuted} style={{ flex: 1 }}>
            I agree to the{' '}
            <AppText variant="small" weight="semibold" color="#17c06e">
              Terms of Service
            </AppText>
          </AppText>
        </Pressable>
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
        <Button title="Create Account" onPress={handleSubmit(onSubmit)} loading={isLoading} size="lg" />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <AppText
            style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}
            color={colors.textSubtle}
          >
            or continue with
          </AppText>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>
        <GoogleSignInButton />
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
          <AppText variant="caption" color={colors.textMuted}>
            Already have an account?
          </AppText>
          <Link href="/login" replace>
            <AppText variant="caption" weight="semibold" color="#17c06e">
              Log in
            </AppText>
          </Link>
        </View>
      </View>
    </Screen>
  );
}

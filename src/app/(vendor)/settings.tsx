import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Button, Chip, SegmentedControl } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppInput } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AppModal, ConfirmDialog } from '@/components/ui/Modal';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { formatNGN } from '@/utils/money';
import {
  useGetMyStoreQuery,
  useGetMyStoresQuery,
  useUpdateStoreMutation,
  useGetStoreTemplatesQuery,
  useUpdateStoreThemeMutation,
  useGetDeliveryRatesQuery,
  useCreateDeliveryRateMutation,
  useDeleteDeliveryRateMutation,
  useRegisterStoreBankMutation,
} from '@/api/storeApi';
import { useGetBanksQuery, useVerifyBankDetailsMutation } from '@/api/userApi';
import { useSwitchStoreMutation, useLogoutMutation } from '@/api/authApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import { useAppDispatch } from '@/hooks';
import { clearCredentials } from '@/features/authSlice';
import type { IStoreOwnerDetails } from '@/types/store';

interface IStoreOwnerWithTheme extends IStoreOwnerDetails {
  theme?: { template?: { id: string } | null } | null;
}

const NIGERIAN_STATES = [
  'Lagos', 'Abuja', 'Ogun', 'Rivers', 'Kano', 'Enugu', 'Anambra', 'Delta',
  'Imo', 'Abia', 'Oyo', 'Kaduna', 'Edo', 'Cross River', 'FCT', 'Other',
];

export default function VendorSettingsScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const toast = useToast();
  const dispatch = useAppDispatch();

  const { data: store, isLoading } = useGetMyStoreQuery();
  const { data: myStores } = useGetMyStoresQuery();
  const { data: banks } = useGetBanksQuery();
  const { data: templates } = useGetStoreTemplatesQuery();
  const { data: deliveryRates, refetch: refetchRates } = useGetDeliveryRatesQuery(
    store?.id ?? '',
    { skip: !store?.id },
  );
  const [updateStore] = useUpdateStoreMutation();
  const [updateTheme] = useUpdateStoreThemeMutation();
  const [registerBank] = useRegisterStoreBankMutation();
  const [verifyBank] = useVerifyBankDetailsMutation();
  const [createRate] = useCreateDeliveryRateMutation();
  const [deleteRate] = useDeleteDeliveryRateMutation();
  const [switchStore] = useSwitchStoreMutation();
  const [logout] = useLogoutMutation();

  const [section, setSection] = useState<'identity' | 'bank' | 'delivery' | 'theme'>('identity');

  // identity form
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [escrowEnabled, setEscrowEnabled] = useState(false);
  const [installmentsEnabled, setInstallmentsEnabled] = useState(false);
  const [savingIdentity, setSavingIdentity] = useState(false);

  // bank form
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [savingBank, setSavingBank] = useState(false);

  // delivery form
  const [rateState, setRateState] = useState('');
  const [rateFee, setRateFee] = useState('');
  const [rateDuration, setRateDuration] = useState('');
  const [savingRate, setSavingRate] = useState(false);
  const [deletingRate, setDeletingRate] = useState<{ id: string; state: string } | null>(null);

  // theme
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);
  const [savingTheme, setSavingTheme] = useState(false);

  // switch store
  const [switchModalOpen, setSwitchModalOpen] = useState(false);
  const [switchingStore, setSwitchingStore] = useState(false);

  const [loadedStoreId, setLoadedStoreId] = useState<string | null>(null);
  useEffect(() => {
    if (!store || loadedStoreId === store.id) {
      return;
    }
    setLoadedStoreId(store.id);
    setStoreName(store.store_name);
    setDescription(store.description ?? '');
    setSubdomain(store.subdomain ?? '');
    setEscrowEnabled(store.escrow_enabled ?? false);
    setInstallmentsEnabled(store.installments_enabled ?? false);
    const storeWithTheme = store as IStoreOwnerWithTheme;
    setSelectedTemplate(storeWithTheme.theme?.template?.id ?? undefined);
  }, [store, loadedStoreId]);

  const handleSaveIdentity = async () => {
    if (!store) {
      return;
    }
    setSavingIdentity(true);
    try {
      await updateStore({
        id: store.id,
        body: {
          store_name: storeName,
          description: description || undefined,
          subdomain: subdomain || undefined,
          escrow_enabled: escrowEnabled,
          installments_enabled: installmentsEnabled,
        },
      }).unwrap();
      toast.showSuccess('Store settings saved');
    } catch (error) {
      toast.showError(getErrorMessage(error));
    } finally {
      setSavingIdentity(false);
    }
  };

  const handleSaveBank = async () => {
    if (!store) {
      return;
    }
    if (!bankCode || !accountNumber) {
      toast.showError('Select bank and enter account number');
      return;
    }
    setSavingBank(true);
    try {
      await verifyBank({ bank_code: bankCode, account_number: accountNumber }).unwrap();
      await registerBank({ storeId: store.id, body: { bank_code: bankCode, account_number: accountNumber } }).unwrap();
      toast.showSuccess('Bank details saved');
    } catch (error) {
      toast.showError(getErrorMessage(error));
    } finally {
      setSavingBank(false);
    }
  };

  const handleAddRate = async () => {
    if (!store) {
      return;
    }
    if (!rateState || !rateFee) {
      toast.showError('State and fee are required');
      return;
    }
    setSavingRate(true);
    try {
      await createRate({
        storeId: store.id,
        body: {
          state: rateState,
          fee: Number(rateFee) * 100,
          duration: rateDuration || undefined,
        },
      }).unwrap();
      toast.showSuccess('Delivery rate added');
      setRateState('');
      setRateFee('');
      setRateDuration('');
      refetchRates();
    } catch (error) {
      toast.showError(getErrorMessage(error));
    } finally {
      setSavingRate(false);
    }
  };

  const handleDeleteRate = async () => {
    if (!deletingRate) {
      return;
    }
    try {
      await deleteRate(deletingRate.id).unwrap();
      toast.showSuccess('Rate removed');
      setDeletingRate(null);
      refetchRates();
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  const handleSaveTheme = async () => {
    if (!store || !selectedTemplate) {
      return;
    }
    setSavingTheme(true);
    try {
      await updateTheme({ id: store.id, body: { template_id: selectedTemplate } }).unwrap();
      toast.showSuccess('Theme updated');
    } catch (error) {
      toast.showError(getErrorMessage(error));
    } finally {
      setSavingTheme(false);
    }
  };

  const handleSwitchStore = async (storeId: string) => {
    setSwitchingStore(true);
    try {
      await switchStore({ store_id: storeId }).unwrap();
      toast.showSuccess('Store switched');
      setSwitchModalOpen(false);
      router.replace('/vendor');
    } catch (error) {
      toast.showError(getErrorMessage(error));
    } finally {
      setSwitchingStore(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // ignore
    }
    dispatch(clearCredentials());
  };

  if (isLoading) {
    return (
      <View style={{ padding: spacing.lg }}>
        <ListSkeleton count={5} />
      </View>
    );
  }

  const bankOptions = banks?.map((bank) => ({ label: bank.name, value: bank.code })) ?? [];

  return (
    <>
      <View style={{ flex: 1 }}>
        <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
          <SegmentedControl<'identity' | 'bank' | 'delivery' | 'theme'>
            value={section}
            onChange={setSection}
            options={[
              { label: 'Store', value: 'identity' },
              { label: 'Bank', value: 'bank' },
              { label: 'Delivery', value: 'delivery' },
              { label: 'Theme', value: 'theme' },
            ]}
          />
          <Spacer height={16} />
          {myStores && myStores.length > 1 ? (
            <Button
              title={`Switch Store (${myStores.length} stores)`}
              variant="outline"
              size="sm"
              fullWidth={false}
              onPress={() => setSwitchModalOpen(true)}
            />
          ) : null}
        </View>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
          {section === 'identity' ? (
            <>
              <AppInput label="Store name" value={storeName} onChangeText={setStoreName} />
              <AppInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
              <AppInput
                label="Subdomain"
                value={subdomain}
                onChangeText={setSubdomain}
                placeholder="mystore"
              />
              <Card style={{ gap: spacing.sm }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <AppText variant="label" weight="semibold">
                    Escrow protection
                  </AppText>
                  <Chip
                    label={escrowEnabled ? 'Enabled' : 'Disabled'}
                    selected={escrowEnabled}
                    onPress={() => setEscrowEnabled((value) => !value)}
                  />
                </Row>
                <AppText variant="small" color={colors.textMuted}>
                  Funds are held securely until buyers confirm delivery.
                </AppText>
                <Spacer height={4} />
                <Row style={{ justifyContent: 'space-between' }}>
                  <AppText variant="label" weight="semibold">
                    Installments (BNPL)
                  </AppText>
                  <Chip
                    label={installmentsEnabled ? 'Enabled' : 'Disabled'}
                    selected={installmentsEnabled}
                    onPress={() => setInstallmentsEnabled((value) => !value)}
                  />
                </Row>
                <AppText variant="small" color={colors.textMuted}>
                  Let buyers pay in installments on your products.
                </AppText>
              </Card>
              <Button title="Save Store Settings" onPress={handleSaveIdentity} loading={savingIdentity} />
            </>
          ) : null}

          {section === 'bank' ? (
            <>
              <Card style={{ gap: spacing.sm }}>
                <AppText variant="label" weight="bold">
                  Current Bank
                </AppText>
                <AppText variant="label" color={colors.textMuted}>
                  {store?.bank_name ? `${store.bank_name} · ${store.account_number}` : 'No bank linked yet'}
                </AppText>
                {store?.payout_verified ? (
                  <AppText variant="small" color={colors.success}>
                    Verified ✓
                  </AppText>
                ) : null}
              </Card>
              <Select
                label="Bank"
                value={bankCode}
                onChange={setBankCode}
                options={bankOptions}
                placeholder="Select your bank"
              />
              <AppInput
                label="Account number"
                value={accountNumber}
                onChangeText={(text) => setAccountNumber(text.replace(/[^0-9]/g, '').slice(0, 10))}
                keyboardType="number-pad"
                placeholder="0123456789"
              />
              <Button title="Save Bank Details" onPress={handleSaveBank} loading={savingBank} />
            </>
          ) : null}

          {section === 'delivery' ? (
            <>
              <Card style={{ gap: spacing.sm }}>
                <AppText variant="label" weight="bold">
                  Current Delivery Rates
                </AppText>
                {deliveryRates && deliveryRates.length > 0 ? (
                  deliveryRates.map((rate) => (
                    <Row key={rate.id} style={{ justifyContent: 'space-between' }}>
                      <View style={{ flex: 1 }}>
                        <AppText variant="small" weight="medium">
                          {rate.state}
                          {rate.location ? ` · ${rate.location}` : ''}
                        </AppText>
                        {rate.duration ? (
                          <AppText variant="small" color={colors.textMuted}>
                            {rate.duration}
                          </AppText>
                        ) : null}
                      </View>
                      <AppText variant="small" weight="bold">
                        {formatNGN(rate.fee)}
                      </AppText>
                      <Pressable onPress={() => setDeletingRate({ id: rate.id, state: rate.state })} hitSlop={8}>
                        <Trash2 size={18} color={colors.danger} />
                      </Pressable>
                    </Row>
                  ))
                ) : (
                  <AppText variant="small" color={colors.textMuted}>
                    No delivery rates configured. Buyers will be charged at checkout.
                  </AppText>
                )}
              </Card>
              <Card style={{ gap: spacing.md }}>
                <AppText variant="label" weight="bold">
                  Add Rate
                </AppText>
                <Select
                  label="State"
                  value={rateState}
                  onChange={setRateState}
                  options={NIGERIAN_STATES.map((state) => ({ label: state, value: state }))}
                  placeholder="Select state"
                />
                <AppInput
                  label="Delivery fee (₦)"
                  value={rateFee}
                  onChangeText={(text) => setRateFee(text.replace(/[^0-9.]/g, ''))}
                  keyboardType="decimal-pad"
                  placeholder="1500"
                />
                <AppInput
                  label="Duration (optional)"
                  value={rateDuration}
                  onChangeText={setRateDuration}
                  placeholder="e.g. 2-4 business days"
                />
                <Button title="Add Rate" onPress={handleAddRate} loading={savingRate} />
              </Card>
            </>
          ) : null}

          {section === 'theme' ? (
            <>
              <Card style={{ gap: spacing.md }}>
                <AppText variant="label" weight="bold">
                  Store Theme
                </AppText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {(templates ?? []).map((template) => (
                    <Button
                      key={template.id}
                      title={template.name}
                      variant={selectedTemplate === template.id ? 'primary' : 'outline'}
                      size="sm"
                      fullWidth={false}
                      onPress={() => setSelectedTemplate(template.id)}
                    />
                  ))}
                </View>
                <Button title="Save Theme" onPress={handleSaveTheme} loading={savingTheme} />
              </Card>
            </>
          ) : null}

          <Spacer height={16} />
          <Button title="Sign Out" variant="danger" onPress={handleLogout} />
        </ScrollView>
      </View>

      <AppModal
        visible={switchModalOpen}
        onClose={() => setSwitchModalOpen(false)}
        title="Switch Store"
        scrollable
      >
        <View style={{ gap: spacing.sm }}>
          {(myStores ?? []).map((storeItem) => (
            <Button
              key={storeItem.id}
              title={storeItem.store_name}
              variant={storeItem.id === store?.id ? 'primary' : 'outline'}
              onPress={() => handleSwitchStore(storeItem.id)}
              loading={switchingStore}
            />
          ))}
        </View>
      </AppModal>

      <ConfirmDialog
        visible={Boolean(deletingRate)}
        title={`Remove rate for ${deletingRate?.state ?? ''}?`}
        destructive
        onConfirm={handleDeleteRate}
        onCancel={() => setDeletingRate(null)}
      />
    </>
  );
}

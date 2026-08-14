import { useState } from 'react';
import { MapPin } from 'lucide-react-native';
import { View } from 'react-native';
import { Stack } from 'expo-router';


import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppInput } from '@/components/ui/Input';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { AppModal, ConfirmDialog } from '@/components/ui/Modal';
import {
  useGetMeQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} from '@/api/userApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { IUserAddress } from '@/types/auth';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

interface AddressForm {
  street: string;
  city: string;
  state: string;
  postal_code: string;
}

const emptyForm: AddressForm = { street: '', city: '', state: '', postal_code: '' };

export default function AddressesScreen() {
  const { colors, spacing } = useAppTheme();
  const toast = useToast();

  const { data: profile, isLoading } = useGetMeQuery();
  const [addAddress] = useAddAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const addresses: IUserAddress[] = profile?.user.addresses ?? [];

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (address: IUserAddress) => {
    setEditingId(address.id ?? null);
    setForm({
      street: address.street,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code ?? '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.street || !form.city || !form.state) {
      toast.showError('Street, city and state are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        street: form.street,
        city: form.city,
        state: form.state,
        country: 'Nigeria',
        postal_code: form.postal_code || undefined,
      };
      if (editingId) {
        await updateAddress({ id: editingId, body: payload }).unwrap();
        toast.showSuccess('Address updated');
      } else {
        await addAddress(payload).unwrap();
        toast.showSuccess('Address added');
      }
      setModalOpen(false);
    } catch (error) {
      toast.showError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) {
      return;
    }
    try {
      await deleteAddress(deletingId).unwrap();
      toast.showSuccess('Address removed');
      setDeletingId(null);
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  const handleSetDefault = async (address: IUserAddress) => {
    if (!address.id) {
      return;
    }
    setSettingDefaultId(address.id);
    try {
      await updateAddress({ id: address.id, body: { is_default: true } }).unwrap();
      toast.showSuccess('Default address updated');
    } catch (error) {
      toast.showError(getErrorMessage(error));
    } finally {
      setSettingDefaultId(null);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Addresses', headerShown: true }} />
      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
        {isLoading ? (
          <ListSkeleton count={3} />
        ) : (
          <>
            <Button title="Add New Address" onPress={openCreate} size="sm" fullWidth={false} />
            {addresses.length === 0 ? (
              <View style={{ paddingTop: spacing.xxl, alignItems: 'center', gap: spacing.sm }}>
                <MapPin size={36} color={colors.textSubtle} />
                <AppText color={colors.textMuted} center>
                  No addresses yet. Add one for faster checkout.
                </AppText>
              </View>
            ) : (
              addresses.map((address) => (
                <Card key={address.id} style={{ gap: spacing.sm }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <AppText variant="label" weight="semibold" numberOfLines={2} style={{ flex: 1 }}>
                      {address.street}, {address.city}
                    </AppText>
                    {address.is_default ? (
                      <AppText variant="small" color={colors.primary}>
                        Default
                      </AppText>
                    ) : null}
                  </Row>
                  <AppText variant="caption" color={colors.textMuted}>
                    {address.state}, {address.country}
                    {address.postal_code ? ` · ${address.postal_code}` : ''}
                  </AppText>
                  <Row style={{ gap: spacing.md, flexWrap: 'wrap' }}>
                    <Button
                      title="Edit"
                      variant="ghost"
                      size="sm"
                      fullWidth={false}
                      onPress={() => openEdit(address)}
                    />
                    <Button
                      title="Delete"
                      variant="ghost"
                      size="sm"
                      fullWidth={false}
                      onPress={() => setDeletingId(address.id ?? null)}
                    />
                    {address.is_default ? null : (
                      <Button
                        title="Set as default"
                        variant="ghost"
                        size="sm"
                        fullWidth={false}
                        loading={settingDefaultId === address.id}
                        onPress={() => handleSetDefault(address)}
                      />
                    )}
                  </Row>
                </Card>
              ))
            )}
          </>
        )}
      </View>

      <AppModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Address' : 'Add Address'}
        footer={<Button title="Save Address" onPress={handleSave} loading={saving} />}
        scrollable
      >
        <View style={{ gap: spacing.md }}>
          <AppInput
            value={form.street}
            onChangeText={(street) => setForm((f) => ({ ...f, street }))}
            label="Street address"
            placeholder="12 Example Street, Off Main Road"
          />
          <AppInput
            value={form.city}
            onChangeText={(city) => setForm((f) => ({ ...f, city }))}
            label="City"
            placeholder="Lagos"
          />
          <AppText variant="label" weight="medium" color={colors.textMuted}>
            State
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {NIGERIAN_STATES.map((state) => (
              <Button
                key={state}
                title={state}
                variant={form.state === state ? 'primary' : 'outline'}
                size="sm"
                fullWidth={false}
                onPress={() => setForm((f) => ({ ...f, state }))}
              />
            ))}
          </View>
          <AppInput
            value={form.postal_code}
            onChangeText={(postal_code) => setForm((f) => ({ ...f, postal_code }))}
            label="Postal code (optional)"
            keyboardType="number-pad"
          />
        </View>
      </AppModal>

      <ConfirmDialog
        visible={Boolean(deletingId)}
        title="Delete address?"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </>
  );
}

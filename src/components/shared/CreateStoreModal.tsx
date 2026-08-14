import { useState } from 'react';
import { View } from 'react-native';
import { useAppTheme } from '@/theme';
import { AppText } from '../ui/Text';
import { AppInput } from '../ui/Input';
import { Button } from '../ui/Button';
import { AppModal } from '../ui/Modal';
import { useCreateStoreMutation } from '@/api/storeApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';

interface CreateStoreModalProps {
  visible: boolean;
  onClose: () => void;
}

/** Mirrors web `CreateStoreModal` — used from the vendor More drawer's store switcher. */
export function CreateStoreModal({ visible, onClose }: CreateStoreModalProps) {
  const { spacing } = useAppTheme();
  const toast = useToast();
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [createStore, { isLoading }] = useCreateStoreMutation();

  const handleCreate = async () => {
    if (!storeName.trim()) {
      toast.showError('Store name is required');
      return;
    }
    try {
      await createStore({ store_name: storeName.trim(), email: email.trim() }).unwrap();
      toast.showSuccess('Store created');
      setStoreName('');
      setEmail('');
      onClose();
    } catch (err) {
      toast.showError(getErrorMessage(err));
    }
  };

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Add Another Store"
      description="Create a second store to sell under a new brand."
    >
      <View style={{ gap: spacing.md }}>
        <AppInput
          value={storeName}
          onChangeText={setStoreName}
          placeholder="Store name"
          label="Store Name"
          autoCapitalize="words"
        />
        <AppInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          label="Store Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Button title="Create Store" onPress={handleCreate} loading={isLoading} />
        <AppText variant="caption" style={{ textAlign: 'center' }}>
          A store review takes up to 48 hours.
        </AppText>
      </View>
    </AppModal>
  );
}

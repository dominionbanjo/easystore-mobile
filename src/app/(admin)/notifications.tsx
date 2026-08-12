import { useState } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AppModal } from '@/components/ui/Modal';
import { AppInput } from '@/components/ui/Input';
import { ListSkeleton } from '@/components/ui/Skeleton';
import {
  useGetAutomatedNotificationsQuery,
  useCreateAutomatedNotificationMutation,
  useUpdateAutomatedNotificationMutation,
} from '@/api/adminApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { IAutomatedNotification } from '@/types/admin';

export default function AdminNotificationsScreen() {
  const { spacing } = useAppTheme();
  const toast = useToast();

  const { data: notifications, isLoading } = useGetAutomatedNotificationsQuery();
  const [create] = useCreateAutomatedNotificationMutation();
  const [update] = useUpdateAutomatedNotificationMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IAutomatedNotification | null>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setMessage('');
    setFrequency('weekly');
    setModalOpen(true);
  };

  const openEdit = (notification: IAutomatedNotification) => {
    setEditing(notification);
    setName(notification.name);
    setMessage(notification.message);
    setFrequency(notification.frequency ?? 'weekly');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !message.trim()) {
      toast.showError('Name and message are required');
      return;
    }
    setSaving(true);
    try {
      const payload = { name: name.trim(), message: message.trim(), frequency };
      if (editing) {
        await update({ id: editing.id, body: payload }).unwrap();
        toast.showSuccess('Notification updated');
      } else {
        await create(payload).unwrap();
        toast.showSuccess('Notification created');
      }
      setModalOpen(false);
    } catch (error) {
      toast.showError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (notification: IAutomatedNotification) => {
    try {
      await update({ id: notification.id, body: { enabled: !notification.enabled } }).unwrap();
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <View style={{ padding: spacing.lg }}>
        <ListSkeleton count={3} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
      <Button title="New Automated Notification" onPress={openCreate} size="sm" fullWidth={false} />
      <View style={{ gap: spacing.md }}>
        {(notifications ?? []).map((notification) => (
          <Card key={notification.id} style={{ gap: spacing.sm }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="label" weight="bold" style={{ flex: 1 }}>
                {notification.name}
              </AppText>
              <StatusBadge status={notification.enabled ? 'active' : 'inactive'} />
            </Row>
            <AppText variant="small" color="gray">
              {notification.message}
            </AppText>
            <AppText variant="small" color="gray">
              Frequency: {notification.frequency ?? '—'}
            </AppText>
            <Row style={{ gap: 8 }}>
              <Button title="Edit" variant="outline" size="sm" fullWidth={false} onPress={() => openEdit(notification)} />
              <Button
                title={notification.enabled ? 'Disable' : 'Enable'}
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() => handleToggle(notification)}
              />
            </Row>
          </Card>
        ))}
        {notifications?.length === 0 ? (
          <AppText color="gray" center>
            No automated notifications configured
          </AppText>
        ) : null}
      </View>

      <AppModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Notification' : 'New Notification'}
        footer={<Button title="Save" onPress={handleSave} loading={saving} />}
        scrollable
      >
        <View style={{ gap: 12 }}>
          <AppInput label="Name" value={name} onChangeText={setName} placeholder="e.g. Order reminder" />
          <AppInput label="Message" value={message} onChangeText={setMessage} multiline numberOfLines={3} />
          <AppText variant="label" weight="medium" color="gray">
            Frequency
          </AppText>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {['daily', 'weekly', 'monthly'].map((option) => (
              <Button
                key={option}
                title={option}
                variant={frequency === option ? 'primary' : 'outline'}
                size="sm"
                fullWidth={false}
                onPress={() => setFrequency(option)}
              />
            ))}
          </View>
        </View>
      </AppModal>
    </View>
  );
}

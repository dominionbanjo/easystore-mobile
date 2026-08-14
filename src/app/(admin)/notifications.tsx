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
import { EmptyState } from '@/components/ui/EmptyState';
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

  const { data: notifications, isLoading, isError, refetch } = useGetAutomatedNotificationsQuery();
  const [create] = useCreateAutomatedNotificationMutation();
  const [update] = useUpdateAutomatedNotificationMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IAutomatedNotification | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recurrenceType, setRecurrenceType] = useState('weekly');
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setTitle('');
    setMessage('');
    setRecurrenceType('weekly');
    setModalOpen(true);
  };

  const openEdit = (notification: IAutomatedNotification) => {
    setEditing(notification);
    setTitle(notification.title);
    setMessage(notification.message);
    setRecurrenceType(notification.recurrence_type ?? 'weekly');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !message.trim()) {
      toast.showError('Title and message are required');
      return;
    }
    setSaving(true);
    try {
      const payload = { title: title.trim(), message: message.trim(), recurrence_type: recurrenceType };
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
      await update({ id: notification.id, body: { is_active: !notification.is_active } }).unwrap();
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

  if (isError) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        <EmptyState
          title="Failed to load"
          description="Check your connection and try again"
          actionLabel="Try Again"
          onAction={refetch}
        />
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
              <AppText variant="label" weight="bold" numberOfLines={2} style={{ flex: 1 }}>
                {notification.title}
              </AppText>
              <StatusBadge status={notification.status ?? 'inactive'} />
            </Row>
            <AppText variant="small" color="gray">
              {notification.message}
            </AppText>
            <AppText variant="small" color="gray">
              Frequency: {notification.recurrence_type ?? '—'}
            </AppText>
            <Row style={{ gap: 8 }}>
              <Button title="Edit" variant="outline" size="sm" fullWidth={false} onPress={() => openEdit(notification)} />
              <Button
                title={notification.is_active ? 'Disable' : 'Enable'}
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
          <AppInput label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Order reminder" />
          <AppInput label="Message" value={message} onChangeText={setMessage} multiline numberOfLines={3} />
          <AppText variant="label" weight="medium" color="gray">
            Frequency
          </AppText>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {['daily', 'weekly', 'monthly'].map((option) => (
              <Button
                key={option}
                title={option}
                variant={recurrenceType === option ? 'primary' : 'outline'}
                size="sm"
                fullWidth={false}
                onPress={() => setRecurrenceType(option)}
              />
            ))}
          </View>
        </View>
      </AppModal>
    </View>
  );
}

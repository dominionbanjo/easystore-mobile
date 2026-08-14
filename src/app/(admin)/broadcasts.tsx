import { useState } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AppModal, ConfirmDialog } from '@/components/ui/Modal';
import { AppInput } from '@/components/ui/Input';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  useGetBroadcastsQuery,
  useCreateBroadcastMutation,
  useUpdateBroadcastMutation,
  useDeleteBroadcastMutation,
} from '@/api/adminApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { IBroadcast } from '@/types/admin';

export default function AdminBroadcastsScreen() {
  const { spacing } = useAppTheme();
  const toast = useToast();

  const { data, isLoading, isError, refetch } = useGetBroadcastsQuery();
  const [createBroadcast] = useCreateBroadcastMutation();
  const [updateBroadcast] = useUpdateBroadcastMutation();
  const [deleteBroadcast] = useDeleteBroadcastMutation();

  const [composeOpen, setComposeOpen] = useState(false);
  const [editing, setEditing] = useState<IBroadcast | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IBroadcast | null>(null);

  const openCompose = () => {
    setEditing(null);
    setSubject('');
    setMessage('');
    setTarget('all');
    setComposeOpen(true);
  };

  const openEdit = (broadcast: IBroadcast) => {
    setEditing(broadcast);
    setSubject(broadcast.subject);
    setMessage(broadcast.body);
    setTarget(broadcast.target ?? 'all');
    setComposeOpen(true);
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.showError('Title and message are required');
      return;
    }
    setSending(true);
    try {
      if (editing) {
        await updateBroadcast({
          id: editing.id,
          body: { subject: subject.trim(), body: message.trim(), target: target === 'all' ? undefined : target },
        }).unwrap();
        toast.showSuccess('Broadcast updated');
      } else {
        await createBroadcast({
          subject: subject.trim(),
          body: message.trim(),
          target: target === 'all' ? undefined : target,
        }).unwrap();
        toast.showSuccess('Broadcast sent');
      }
      setComposeOpen(false);
      setSubject('');
      setMessage('');
    } catch (error) {
      toast.showError(getErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await deleteBroadcast(deleteTarget.id).unwrap();
      toast.showSuccess('Broadcast deleted');
      setDeleteTarget(null);
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
    <View style={{ flex: 1 }}>
      <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
        <Button title="New Broadcast" onPress={openCompose} size="sm" fullWidth={false} />
      </View>
      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
        {(data ?? []).map((broadcast) => (
          <Card key={broadcast.id} style={{ gap: spacing.sm }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="label" weight="bold" numberOfLines={2} style={{ flex: 1 }}>
                {broadcast.subject}
              </AppText>
              <StatusBadge status={broadcast.status ?? 'sent'} />
            </Row>
            <AppText variant="small" color="gray">
              {broadcast.body}
            </AppText>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" color="gray">
                {broadcast.target ?? 'all'} ·{' '}
                {broadcast.sent_at
                  ? new Date(broadcast.sent_at).toLocaleDateString('en-NG')
                  : broadcast.created_at
                    ? new Date(broadcast.created_at).toLocaleDateString('en-NG')
                    : ''}
              </AppText>
              <Row style={{ gap: 8 }}>
                <Button title="Edit" variant="outline" size="sm" fullWidth={false} onPress={() => openEdit(broadcast)} />
                <Button title="Delete" variant="ghost" size="sm" fullWidth={false} onPress={() => setDeleteTarget(broadcast)} />
              </Row>
            </Row>
          </Card>
        ))}
        {(data ?? []).length === 0 ? (
          <AppText color="gray" center>
            No broadcasts yet
          </AppText>
        ) : null}
      </View>

      <AppModal
        visible={composeOpen}
        onClose={() => setComposeOpen(false)}
        title={editing ? 'Edit Broadcast' : 'New Broadcast'}
        footer={<Button title={editing ? 'Save Changes' : 'Send Broadcast'} onPress={handleSend} loading={sending} />}
        scrollable
      >
        <View style={{ gap: 12 }}>
          <AppInput label="Title" value={subject} onChangeText={setSubject} placeholder="Flash sale this weekend!" />
          <AppInput label="Message" value={message} onChangeText={setMessage} multiline numberOfLines={4} placeholder="Write your message…" />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {['all', 'users', 'vendors'].map((option) => (
              <Button
                key={option}
                title={option}
                variant={target === option ? 'primary' : 'outline'}
                size="sm"
                fullWidth={false}
                onPress={() => setTarget(option)}
              />
            ))}
          </View>
        </View>
      </AppModal>

      <ConfirmDialog
        visible={Boolean(deleteTarget)}
        title="Delete broadcast?"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

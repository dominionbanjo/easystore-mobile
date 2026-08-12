import { useState } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { AppModal, ConfirmDialog } from '@/components/ui/Modal';
import { AppInput } from '@/components/ui/Input';
import {
  useGetBroadcastsQuery,
  useCreateBroadcastMutation,
  useDeleteBroadcastMutation,
} from '@/api/adminApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { IBroadcast } from '@/types/admin';

export default function AdminBroadcastsScreen() {
  const { spacing } = useAppTheme();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetBroadcastsQuery({ page });
  const [createBroadcast] = useCreateBroadcastMutation();
  const [deleteBroadcast] = useDeleteBroadcastMutation();

  const [composeOpen, setComposeOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [sending, setSending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IBroadcast | null>(null);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.showError('Title and message are required');
      return;
    }
    setSending(true);
    try {
      await createBroadcast({
        title: title.trim(),
        message: message.trim(),
        audience: audience === 'all' ? undefined : audience,
      }).unwrap();
      toast.showSuccess('Broadcast sent');
      setComposeOpen(false);
      setTitle('');
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

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
        <Button title="New Broadcast" onPress={() => setComposeOpen(true)} size="sm" fullWidth={false} />
      </View>
      <Spacer height={8} />
      <PaginatedList
        items={data?.items}
        pagination={data?.pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        isLoadingMore={isFetching && page > 1}
        onEndReached={() => setPage((p) => p + 1)}
        onRefresh={() => setPage(1)}
        keyExtractor={(item) => item.id}
        renderItem={(broadcast) => (
          <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="label" weight="bold" style={{ flex: 1 }}>
                {broadcast.title}
              </AppText>
              <StatusBadge status={broadcast.status ?? 'sent'} />
            </Row>
            <AppText variant="small" color="gray">
              {broadcast.message}
            </AppText>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" color="gray">
                {broadcast.audience ?? 'all'} ·{' '}
                {broadcast.sent_at
                  ? new Date(broadcast.sent_at).toLocaleDateString('en-NG')
                  : broadcast.created_at
                    ? new Date(broadcast.created_at).toLocaleDateString('en-NG')
                    : ''}
              </AppText>
              <Button title="Delete" variant="ghost" size="sm" fullWidth={false} onPress={() => setDeleteTarget(broadcast)} />
            </Row>
          </Card>
        )}
        emptyTitle="No broadcasts yet"
        emptyDescription="Broadcast messages to your users"
      />

      <AppModal
        visible={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="New Broadcast"
        footer={<Button title="Send Broadcast" onPress={handleSend} loading={sending} />}
        scrollable
      >
        <View style={{ gap: 12 }}>
          <AppInput label="Title" value={title} onChangeText={setTitle} placeholder="Flash sale this weekend!" />
          <AppInput label="Message" value={message} onChangeText={setMessage} multiline numberOfLines={4} placeholder="Write your message…" />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {['all', 'users', 'vendors', 'staff'].map((option) => (
              <Button
                key={option}
                title={option}
                variant={audience === option ? 'primary' : 'outline'}
                size="sm"
                fullWidth={false}
                onPress={() => setAudience(option)}
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

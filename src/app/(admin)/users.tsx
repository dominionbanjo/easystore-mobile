import { useState } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Button, Chip } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { AppImage } from '@/components/shared/AppImage';
import { AppModal } from '@/components/ui/Modal';
import { useGetAdminUsersQuery, useUpdateUserStatusMutation } from '@/api/adminApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { IAdminUser } from '@/types/admin';

const TYPE_FILTERS = ['', 'user', 'vendor', 'staff', 'admin'];

export default function AdminUsersScreen() {
  const { spacing } = useAppTheme();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [accountType, setAccountType] = useState('');
  const { data, isLoading, isFetching } = useGetAdminUsersQuery({
    page,
    limit: 25,
    account_type: accountType || undefined,
  });

  const [updateStatus] = useUpdateUserStatusMutation();
  const [statusTarget, setStatusTarget] = useState<IAdminUser | null>(null);
  const [statusValue, setStatusValue] = useState('');

  const handleStatusChange = async () => {
    if (!statusTarget) {
      return;
    }
    try {
      await updateStatus({ id: statusTarget.id, status: statusValue }).unwrap();
      toast.showSuccess('User status updated');
      setStatusTarget(null);
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: spacing.md }}>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          {TYPE_FILTERS.map((filter) => (
            <Chip
              key={filter}
              label={filter === '' ? 'All' : filter}
              selected={accountType === filter}
              onPress={() => {
                setAccountType(filter);
                setPage(1);
              }}
            />
          ))}
        </View>
      </View>
      <PaginatedList
        items={data?.items}
        pagination={data?.pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        isLoadingMore={isFetching && page > 1}
        onEndReached={() => setPage((p) => p + 1)}
        onRefresh={() => setPage(1)}
        keyExtractor={(item) => item.id}
        renderItem={(user) => (
          <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}>
            <Row style={{ gap: spacing.md }}>
              <AppImage
                uri={user.avatar}
                style={{ width: 44, height: 44, borderRadius: 22 }}
                fallbackText={`${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`}
              />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="label" weight="semibold">
                  {user.first_name} {user.last_name}
                </AppText>
                <AppText variant="small" color="gray" numberOfLines={1}>
                  {user.email}
                </AppText>
                <Row style={{ gap: spacing.xs }}>
                  <StatusBadge status={user.account_status} />
                  <AppText variant="small" color="gray">
                    {user.account_type}
                  </AppText>
                </Row>
              </View>
              <Button
                title="Change Status"
                variant="outline"
                size="sm"
                fullWidth={false}
                onPress={() => {
                  setStatusTarget(user);
                  setStatusValue(user.account_status);
                }}
              />
            </Row>
          </Card>
        )}
        emptyTitle="No users found"
      />

      <AppModal
        visible={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        title={`Status · ${statusTarget?.first_name ?? ''}`}
        footer={<Button title="Update Status" onPress={handleStatusChange} />}
        scrollable
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {['active', 'pending', 'restricted', 'banned'].map((status) => (
            <Button
              key={status}
              title={status}
              variant={statusValue === status ? 'primary' : 'outline'}
              size="sm"
              fullWidth={false}
              onPress={() => setStatusValue(status)}
            />
          ))}
        </View>
      </AppModal>
    </View>
  );
}

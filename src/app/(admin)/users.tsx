import { useState } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { AppModal } from '@/components/ui/Modal';
import { AppInput } from '@/components/ui/Input';
import { FilterDropdown, type FilterOption } from '@/components/ui/FilterDropdown';
import { useGetAdminUsersQuery, useUpdateUserStatusMutation } from '@/api/adminApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { IAdminUser } from '@/types/admin';

const STATUS_FILTERS: FilterOption[] = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Restricted', value: 'restricted' },
  { label: 'Banned', value: 'banned' },
];

const TYPE_FILTERS: FilterOption[] = [
  { label: 'All types', value: '' },
  { label: 'User', value: 'user' },
  { label: 'Vendor', value: 'vendor' },
  { label: 'Staff', value: 'staff' },
  { label: 'Admin', value: 'admin' },
];

export default function AdminUsersScreen() {
  const { colors, radius, spacing } = useAppTheme();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [accountType, setAccountType] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading, isFetching, isError, refetch } = useGetAdminUsersQuery({
    page,
    limit: 25,
    search: search.trim() || undefined,
    account_type: accountType || undefined,
  });

  const [updateStatus, { isLoading: updatingStatus }] = useUpdateUserStatusMutation();
  const [statusTarget, setStatusTarget] = useState<IAdminUser | null>(null);
  const [statusValue, setStatusValue] = useState('');

  const items = (data?.items ?? []).filter(
    (user) => status === '' || user.account_status === status,
  );

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
      <View style={{ padding: spacing.md, gap: spacing.sm }}>
        <AppInput
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setPage(1);
          }}
          placeholder="Search by name or email…"
          size="sm"
        />
        <AppText variant="small" weight="semibold" color={colors.textMuted}>
          {data?.pagination.total ?? 0} users
        </AppText>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <FilterDropdown
              label="Status"
              value={status}
              onChange={(filter) => {
                setStatus(filter);
                setPage(1);
              }}
              options={STATUS_FILTERS}
            />
          </View>
          <View style={{ flex: 1 }}>
            <FilterDropdown
              label="Type"
              value={accountType}
              onChange={(filter) => {
                setAccountType(filter);
                setPage(1);
              }}
              options={TYPE_FILTERS}
            />
          </View>
        </View>
      </View>
      <PaginatedList
        items={items}
        pagination={data?.pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        error={isError}
        onRetry={refetch}
        isLoadingMore={isFetching && page > 1}
        onEndReached={() => setPage((p) => p + 1)}
        onRefresh={() => setPage(1)}
        keyExtractor={(item) => item.id}
        renderItem={(user) => (
          <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}>
            <Row style={{ gap: spacing.md }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: radius.full,
                  backgroundColor: colors.surfaceAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppText variant="label" weight="bold" color={colors.textMuted}>
                  {user.first_name[0] ?? ''}{user.last_name[0] ?? ''}
                </AppText>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="label" weight="semibold" numberOfLines={1}>
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
        footer={<Button title="Update Status" onPress={handleStatusChange} loading={updatingStatus} />}
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

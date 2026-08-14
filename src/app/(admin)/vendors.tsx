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
import { useGetAdminVendorsQuery, useUpdateVendorStatusMutation } from '@/api/adminApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { IAdminVendor } from '@/types/admin';

const STATUS_FILTERS: FilterOption[] = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'restricted', label: 'Restricted' },
  { value: 'banned', label: 'Banned' },
];

export default function AdminVendorsScreen() {
  const { colors, radius, spacing } = useAppTheme();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading, isFetching, isError, refetch } = useGetAdminVendorsQuery({
    page,
    limit: 25,
    search: search.trim() || undefined,
    status: status || undefined,
  });

  const [updateStatus, { isLoading: updatingStatus }] = useUpdateVendorStatusMutation();
  const [target, setTarget] = useState<IAdminVendor | null>(null);
  const [statusValue, setStatusValue] = useState('');

  const handleUpdate = async () => {
    if (!target) {
      return;
    }
    const store = target.stores?.[0];
    if (!store) {
      toast.showError('Vendor has no store');
      return;
    }
    try {
      await updateStatus({ storeId: store.id, status: statusValue }).unwrap();
      toast.showSuccess('Vendor status updated');
      setTarget(null);
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  const openModal = (vendor: IAdminVendor) => {
    const store = vendor.stores?.[0];
    if (!store) {
      toast.showError('Vendor has no store');
      return;
    }
    setTarget(vendor);
    setStatusValue(store.status);
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
          placeholder="Search vendors…"
          size="sm"
        />
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
      <PaginatedList
        items={data?.items}
        pagination={data?.pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        error={isError}
        onRetry={refetch}
        isLoadingMore={isFetching && page > 1}
        onEndReached={() => setPage((p) => p + 1)}
        onRefresh={() => setPage(1)}
        keyExtractor={(item) => item.id}
        renderItem={(vendor) => {
          const store = vendor.stores?.[0];
          return (
            <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}>
              <Row style={{ gap: spacing.md }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: radius.full,
                    backgroundColor: colors.surfaceAlt,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppText variant="label" weight="bold" color={colors.textMuted}>
                    {store?.store_name?.[0] ?? vendor.first_name[0] ?? ''}
                  </AppText>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="label" weight="semibold" numberOfLines={1}>
                    {store?.store_name ?? `${vendor.first_name} ${vendor.last_name}`}
                  </AppText>
                  <AppText variant="small" color="gray" numberOfLines={1}>
                    {vendor.first_name} {vendor.last_name} · {vendor.email}
                  </AppText>
                  <Row style={{ gap: spacing.xs }}>
                    <StatusBadge status={store?.status ?? vendor.account_status} />
                    <AppText variant="small" color="gray">
                      {store?.address_state ?? ''}
                    </AppText>
                  </Row>
                </View>
                <Button
                  title="Status"
                  variant="outline"
                  size="sm"
                  fullWidth={false}
                  onPress={() => openModal(vendor)}
                />
              </Row>
            </Card>
          );
        }}
        emptyTitle="No vendors found"
      />

      <AppModal
        visible={Boolean(target)}
        onClose={() => setTarget(null)}
        title={`Status · ${target?.stores?.[0]?.store_name ?? ''}`}
        footer={<Button title="Update Status" onPress={handleUpdate} loading={updatingStatus} />}
        scrollable
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {['active', 'pending', 'restricted', 'banned'].map((option) => (
            <Button
              key={option}
              title={option === 'active' ? 'Approved' : option}
              variant={statusValue === option ? 'primary' : 'outline'}
              size="sm"
              fullWidth={false}
              onPress={() => setStatusValue(option)}
            />
          ))}
        </View>
      </AppModal>
    </View>
  );
}

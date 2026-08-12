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
import { formatNGNCompact } from '@/utils/money';
import { useGetAdminVendorsQuery, useUpdateVendorStatusMutation } from '@/api/adminApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { IAdminVendor } from '@/types/admin';

export default function AdminVendorsScreen() {
  const { spacing } = useAppTheme();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { data, isLoading, isFetching } = useGetAdminVendorsQuery({
    page,
    limit: 25,
    status: status || undefined,
  });

  const [updateStatus] = useUpdateVendorStatusMutation();
  const [target, setTarget] = useState<IAdminVendor | null>(null);
  const [statusValue, setStatusValue] = useState('');

  const handleUpdate = async () => {
    if (!target) {
      return;
    }
    try {
      await updateStatus({ storeId: target.id, status: statusValue }).unwrap();
      toast.showSuccess('Vendor status updated');
      setTarget(null);
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: spacing.md }}>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          {['', 'active', 'pending', 'restricted', 'banned'].map((filter) => (
            <Chip
              key={filter}
              label={filter === '' ? 'All' : filter}
              selected={status === filter}
              onPress={() => {
                setStatus(filter);
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
        renderItem={(vendor) => (
          <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}>
            <Row style={{ gap: spacing.md }}>
              <AppImage
                uri={vendor.logo}
                style={{ width: 48, height: 48, borderRadius: 24 }}
                fallbackText={vendor.store_name}
              />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="label" weight="semibold">
                  {vendor.store_name}
                </AppText>
                <AppText variant="small" color="gray" numberOfLines={1}>
                  {vendor.user
                    ? `${vendor.user.first_name} ${vendor.user.last_name} · ${vendor.user.email}`
                    : vendor.category}
                </AppText>
                <Row style={{ gap: spacing.xs }}>
                  <StatusBadge status={vendor.status} />
                  <AppText variant="small" color="gray">
                    {vendor.total_orders ?? 0} orders · {formatNGNCompact(vendor.total_revenue ?? 0)}
                  </AppText>
                </Row>
              </View>
              <Button
                title="Status"
                variant="outline"
                size="sm"
                fullWidth={false}
                onPress={() => {
                  setTarget(vendor);
                  setStatusValue(vendor.status);
                }}
              />
            </Row>
          </Card>
        )}
        emptyTitle="No vendors found"
      />

      <AppModal
        visible={Boolean(target)}
        onClose={() => setTarget(null)}
        title={`Status · ${target?.store_name ?? ''}`}
        footer={<Button title="Update Status" onPress={handleUpdate} />}
        scrollable
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {['active', 'pending', 'restricted', 'banned'].map((option) => (
            <Button
              key={option}
              title={option}
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

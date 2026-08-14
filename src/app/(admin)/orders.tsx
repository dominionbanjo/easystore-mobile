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
import { formatNGN } from '@/utils/money';
import { useGetAdminOrdersQuery, useUpdateAdminOrderStatusMutation } from '@/api/adminApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { IAdminOrder } from '@/types/admin';

const STATUS_FILTERS: FilterOption[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Paid', value: 'paid' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'canceled' },
];
const STATUS_OPTIONS = ['pending', 'processing', 'paid', 'shipped', 'delivered', 'completed', 'canceled'];

export default function AdminOrdersScreen() {
  const { spacing } = useAppTheme();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading, isFetching, isError, refetch } = useGetAdminOrdersQuery({
    page,
    limit: 20,
    status: status || undefined,
  });

  const [updateStatus, { isLoading: updatingStatus }] = useUpdateAdminOrderStatusMutation();
  const [target, setTarget] = useState<IAdminOrder | null>(null);
  const [statusValue, setStatusValue] = useState('');

  const items = (data?.items ?? []).filter((order) => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return true;
    }
    return (
      order.id.toLowerCase().includes(query) ||
      (order.store?.store_name ?? '').toLowerCase().includes(query)
    );
  });

  const handleUpdate = async () => {
    if (!target) {
      return;
    }
    try {
      await updateStatus({ id: target.id, status: statusValue }).unwrap();
      toast.showSuccess('Order status updated');
      setTarget(null);
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
          placeholder="Search by order id or store…"
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
        renderItem={(order) => (
          <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" color="gray">
                {new Date(order.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </AppText>
              <StatusBadge status={order.status} />
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="label" weight="medium" numberOfLines={1} style={{ flex: 1 }}>
                {order.store?.store_name ?? `Order ${order.id.slice(0, 8)}`}
              </AppText>
              <AppText variant="label" weight="bold" color="green">
                {formatNGN(order.total)}
              </AppText>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" color="gray">
                {order.buyer ? `${order.buyer.first_name} ${order.buyer.last_name}` : 'Guest'}
              </AppText>
              <Button
                title="Update"
                variant="outline"
                size="sm"
                fullWidth={false}
                onPress={() => {
                  setTarget(order);
                  setStatusValue(order.status);
                }}
              />
            </Row>
          </Card>
        )}
        emptyTitle="No orders found"
      />

      <AppModal
        visible={Boolean(target)}
        onClose={() => setTarget(null)}
        title={`Update Order ${target?.id.slice(0, 8) ?? ''}`}
        footer={<Button title="Update Status" onPress={handleUpdate} loading={updatingStatus} />}
        scrollable
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {STATUS_OPTIONS.map((option) => (
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

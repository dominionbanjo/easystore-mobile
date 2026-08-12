import { useState } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Button, Chip } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { AppModal } from '@/components/ui/Modal';
import { formatNGN } from '@/utils/money';
import { useGetAdminOrdersQuery, useUpdateAdminOrderStatusMutation } from '@/api/adminApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { IOrder } from '@/types/order';

export default function AdminOrdersScreen() {
  const { spacing } = useAppTheme();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { data, isLoading, isFetching } = useGetAdminOrdersQuery({
    page,
    limit: 20,
    status: status || undefined,
  });

  const [updateStatus] = useUpdateAdminOrderStatusMutation();
  const [target, setTarget] = useState<IOrder | null>(null);
  const [statusValue, setStatusValue] = useState('');

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
      <View style={{ padding: spacing.md }}>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          {['', 'pending', 'processing', 'paid', 'in_transit', 'delivered', 'completed', 'canceled'].map(
            (filter) => (
              <Chip
                key={filter}
                label={filter === '' ? 'All' : filter}
                selected={status === filter}
                onPress={() => {
                  setStatus(filter);
                  setPage(1);
                }}
              />
            ),
          )}
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
                {order.order_items[0]?.name ?? `Order ${order.id.slice(0, 8)}`}
                {order.order_items.length > 1 ? ` +${order.order_items.length - 1}` : ''}
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
        footer={<Button title="Update Status" onPress={handleUpdate} />}
        scrollable
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {['pending', 'processing', 'paid', 'in_transit', 'delivered', 'completed', 'failed', 'canceled'].map(
            (option) => (
              <Button
                key={option}
                title={option}
                variant={statusValue === option ? 'primary' : 'outline'}
                size="sm"
                fullWidth={false}
                onPress={() => setStatusValue(option)}
              />
            ),
          )}
        </View>
      </AppModal>
    </View>
  );
}

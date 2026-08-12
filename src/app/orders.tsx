import { useState } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Chip } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { AppImage } from '@/components/shared/AppImage';
import { formatNGN } from '@/utils/money';
import { useGetMyOrdersQuery } from '@/api/orderApi';
import type { IOrder } from '@/types/order';

const STATUS_FILTERS = ['', 'pending', 'processing', 'paid', 'in_transit', 'delivered', 'completed', 'canceled'];

export default function OrdersScreen() {
  const { spacing } = useAppTheme();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetMyOrdersQuery({
    status: status || undefined,
    page,
    limit: 10,
  });

  return (
    <>
      <Stack.Screen options={{ title: 'My Orders', headerShown: true }} />
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
          <ScrollViewHorizontal>
            {STATUS_FILTERS.map((filter) => (
              <Chip
                key={filter}
                label={filter === '' ? 'All' : filter.replace('_', ' ')}
                selected={status === filter}
                onPress={() => {
                  setStatus(filter);
                  setPage(1);
                }}
              />
            ))}
          </ScrollViewHorizontal>
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
          renderItem={(order) => <OrderRow order={order} />}
          emptyTitle="No orders yet"
          emptyDescription="Your orders will appear here"
        />
      </View>
    </>
  );
}

function ScrollViewHorizontal({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      {children}
    </View>
  );
}

function OrderRow({ order }: { order: IOrder }) {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const firstItem = order.order_items[0];
  return (
    <Card
      onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })}
      style={{ gap: spacing.md, marginHorizontal: 16, marginBottom: 12 }}
    >
      <Row style={{ justifyContent: 'space-between' }}>
        <AppText variant="small" color={colors.textSubtle}>
          {new Date(order.created_at).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </AppText>
        <StatusBadge status={order.status} />
      </Row>
      <Row style={{ gap: spacing.md }}>
        <AppImage
          uri={firstItem?.image}
          style={{ width: 56, height: 56 }}
          fallbackText={firstItem?.name ?? 'Item'}
        />
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="label" weight="medium" numberOfLines={1}>
            {firstItem?.name ?? 'Order'}
            {order.order_items.length > 1 ? ` +${order.order_items.length - 1} more` : ''}
          </AppText>
          <AppText variant="small" color={colors.textMuted}>
            {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} item(s) ·{' '}
            {formatNGN(order.total)}
          </AppText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </Row>
      {order.delivery ? (
        <Row style={{ gap: spacing.xs }}>
          <Ionicons name="cube-outline" size={14} color={colors.textSubtle} />
          <AppText variant="small" color={colors.textSubtle}>
            {order.delivery.delivery_status.replace(/_/g, ' ')}
          </AppText>
        </Row>
      ) : null}
    </Card>
  );
}

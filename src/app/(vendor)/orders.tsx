import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Chip } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppImage } from '@/components/shared/AppImage';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { formatNGN } from '@/utils/money';
import { useGetVendorOrdersQuery } from '@/api/orderApi';
import type { IOrder } from '@/types/order';

const STATUS_FILTERS = ['', 'pending', 'processing', 'paid', 'in_transit', 'delivered', 'completed', 'canceled'];

export default function VendorOrdersScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetVendorOrdersQuery({
    status: status || undefined,
    page,
    limit: 10,
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
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
        renderItem={(order) => <VendorOrderRow order={order} />}
        emptyTitle="No orders"
        emptyDescription="New orders will appear here"
      />
    </View>
  );
}

function VendorOrderRow({ order }: { order: IOrder }) {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const firstItem = order.order_items[0];
  const customer = order.buyer;

  return (
    <Card
      onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })}
      style={{ marginHorizontal: 16, marginBottom: 12, gap: spacing.sm }}
    >
      <Row style={{ justifyContent: 'space-between' }}>
        <AppText variant="small" color={colors.textSubtle}>
          {new Date(order.created_at).toLocaleString('en-NG', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </AppText>
        <StatusBadge status={order.status} />
      </Row>
      <Row style={{ gap: spacing.md }}>
        <AppImage
          uri={firstItem?.image}
          style={{ width: 52, height: 52 }}
          fallbackText={firstItem?.name ?? 'Item'}
        />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="label" weight="medium" numberOfLines={1}>
            {firstItem?.name ?? 'Order'}
            {order.order_items.length > 1 ? ` +${order.order_items.length - 1}` : ''}
          </AppText>
          <AppText variant="small" color={colors.textMuted} numberOfLines={1}>
            {customer ? `${customer.first_name} ${customer.last_name}` : 'Guest'}
          </AppText>
          <AppText variant="small" weight="semibold" color={colors.primary}>
            {formatNGN(order.total)} · {order.payment_method}
          </AppText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </Row>
    </Card>
  );
}

import { useState } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { ChevronRight, Package } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { AppInput } from '@/components/ui/Input';
import { FilterDropdown, type FilterOption } from '@/components/ui/FilterDropdown';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { AppImage } from '@/components/shared/AppImage';
import { formatNGN } from '@/utils/money';
import { useGetMyOrdersQuery } from '@/api/orderApi';
import type { IOrder } from '@/types/order';

const STATUS_FILTERS: FilterOption[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'canceled' },
];

type OrderWithReference = IOrder & { order_reference?: string };

export default function OrdersScreen() {
  const { spacing } = useAppTheme();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');

  const { data, isLoading, isFetching, isError, refetch } = useGetMyOrdersQuery({
    status: status || undefined,
    page,
    limit: 10,
  });

  const searchTerm = query.trim().toLowerCase();
  const filteredItems = (data?.items ?? []).filter((order) => {
    if (!searchTerm) {
      return true;
    }
    const reference = (order as OrderWithReference).order_reference ?? order.id;
    return reference.toLowerCase().includes(searchTerm);
  });

  return (
    <>
      <Stack.Screen options={{ title: 'My Orders', headerShown: true }} />
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            gap: spacing.md,
            flexShrink: 0,
          }}
        >
          <AppInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by order ID or reference"
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
        <View style={{ height: spacing.md }} />
        <PaginatedList
          items={filteredItems}
          pagination={data?.pagination}
          isLoading={isLoading}
          isFetching={isFetching}
          isLoadingMore={isFetching && page > 1}
          error={isError}
          onRetry={() => refetch()}
          onEndReached={() => setPage((p) => p + 1)}
          onRefresh={() => setPage(1)}
          keyExtractor={(item) => item.id}
          renderItem={(order) => <OrderRow order={order} />}
          emptyTitle={searchTerm ? 'No matching orders' : 'No orders yet'}
          emptyDescription={searchTerm ? 'Try a different order ID or reference' : 'Your orders will appear here'}
        />
      </View>
    </>
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
        <AppText variant="small" color={colors.textSubtle} numberOfLines={1} style={{ flex: 1 }}>
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
        <ChevronRight size={18} color={colors.textSubtle} />
      </Row>
      {order.delivery ? (
        <Row style={{ gap: spacing.xs }}>
          <Package size={14} color={colors.textSubtle} />
          <AppText variant="small" color={colors.textSubtle} numberOfLines={1} style={{ flex: 1 }}>
            {order.delivery.delivery_status.replace(/_/g, ' ')}
          </AppText>
        </Row>
      ) : null}
    </Card>
  );
}

import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';


import { ChevronRight, Search } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppImage } from '@/components/shared/AppImage';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { FilterDropdown, type FilterOption } from '@/components/ui/FilterDropdown';
import { formatNGN } from '@/utils/money';
import { useGetVendorOrdersQuery } from '@/api/orderApi';
import type { IOrder } from '@/types/order';

const STATUS_FILTERS: FilterOption[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Processing', value: 'processing' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'In Transit', value: 'in_transit' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Returned', value: 'returned' },
  { label: 'Cancelled', value: 'canceled' },
];

interface IOrderWithReference extends IOrder {
  order_reference?: string;
}

function getOrderReference(order: IOrder): string {
  return (order as IOrderWithReference).order_reference ?? order.id;
}

export default function VendorOrdersScreen() {
  const { colors, spacing } = useAppTheme();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, refetch } = useGetVendorOrdersQuery({
    status: status || undefined,
    page,
    limit: 10,
  });

  const query = search.trim().toLowerCase();
  const visibleOrders = (data?.items ?? []).filter((order) => {
    if (!query) {
      return true;
    }
    const reference = getOrderReference(order).toLowerCase();
    return reference.includes(query) || order.id.toLowerCase().includes(query);
  });

  if (isError) {
    return (
      <View style={{ padding: spacing.xl, gap: spacing.md, alignItems: 'center' }}>
        <AppText center color={colors.textMuted}>
          Couldn&apos;t load orders
        </AppText>
        <Button title="Try Again" onPress={refetch} fullWidth={false} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md }}>
        <Card padded={false} style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
          <Row style={{ gap: spacing.sm }}>
            <Search size={16} color={colors.textSubtle} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by order ID or reference…"
              placeholderTextColor={colors.textSubtle}
              style={{ flex: 1, fontSize: 14, color: colors.text }}
            />
          </Row>
        </Card>
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
        items={visibleOrders}
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
  const reference = `#${getOrderReference(order).slice(0, 8)}`;

  return (
    <Card
      onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })}
      style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}
    >
      <Row style={{ justifyContent: 'space-between' }}>
        <AppText variant="small" weight="semibold" numberOfLines={1} style={{ flex: 1 }}>
          {reference}
        </AppText>
        <StatusBadge status={order.status} />
      </Row>
      <AppText variant="small" color={colors.textSubtle}>
        {new Date(order.created_at).toLocaleString('en-NG', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </AppText>
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
            {formatNGN(order.total)}
            {order.payment_method ? ` · ${order.payment_method}` : ''}
          </AppText>
        </View>
        <ChevronRight size={18} color={colors.textSubtle} />
      </Row>
    </Card>
  );
}

import { useState } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatNGN } from '@/utils/money';
import { useGetStoreCustomersQuery } from '@/api/storeApi';
import { Ionicons } from '@expo/vector-icons';

export default function VendorCustomersScreen() {
  const { colors, spacing } = useAppTheme();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetStoreCustomersQuery({ page, limit: 20 });

  return (
    <View style={{ flex: 1 }}>
      <PaginatedList
        items={data?.items}
        pagination={data?.pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        isLoadingMore={isFetching && page > 1}
        onEndReached={() => setPage((p) => p + 1)}
        onRefresh={() => setPage(1)}
        keyExtractor={(item) => item.id}
        renderItem={(customer) => (
          <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="label" weight="semibold" style={{ flex: 1 }}>
                {customer.name}
              </AppText>
              <StatusBadge status={customer.orders_count > 0 ? 'active' : 'inactive'} />
            </Row>
            {customer.email ? (
              <AppText variant="small" color={colors.textMuted}>
                {customer.email}
              </AppText>
            ) : null}
            <Row style={{ gap: spacing.md }}>
              <Row style={{ gap: 4 }}>
                <Ionicons name="receipt-outline" size={14} color={colors.textSubtle} />
                <AppText variant="small" color={colors.textMuted}>
                  {customer.orders_count} orders
                </AppText>
              </Row>
              <Row style={{ gap: 4 }}>
                <Ionicons name="wallet-outline" size={14} color={colors.textSubtle} />
                <AppText variant="small" weight="semibold" color={colors.primary}>
                  {formatNGN(customer.total_spent)}
                </AppText>
              </Row>
            </Row>
          </Card>
        )}
        emptyTitle="No customers yet"
        emptyDescription="Customers who order from your store will appear here"
      />
    </View>
  );
}

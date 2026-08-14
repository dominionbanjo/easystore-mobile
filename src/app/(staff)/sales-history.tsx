import { useState } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Chip } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { formatNGN } from '@/utils/money';
import { useGetSalesHistoryQuery } from '@/api/orderApi';

export default function StaffSalesHistoryScreen() {
  const { spacing } = useAppTheme();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading, isFetching } = useGetSalesHistoryQuery({
    page,
    limit: 20,
    status: status || undefined,
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: spacing.md }}>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          {['', 'completed', 'pending', 'paid', 'canceled'].map((filter) => (
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
        renderItem={(sale) => (
          <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" color="gray">
                {new Date(sale.created_at).toLocaleString('en-NG', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </AppText>
              <AppText variant="label" weight="medium" numberOfLines={1} style={{ flex: 1 }}>
                {sale.items?.[0]?.name ?? 'Sale'}
                {sale.items && sale.items.length > 1
                  ? ` +${sale.items.length - 1}`
                  : ''}
              </AppText>
              <AppText variant="label" weight="bold" color="green">
                {formatNGN(sale.total)}
              </AppText>
            </Row>
          </Card>
        )}
        emptyTitle="No sales yet"
        emptyDescription="Sales recorded at the terminal appear here"
      />
    </View>
  );
}

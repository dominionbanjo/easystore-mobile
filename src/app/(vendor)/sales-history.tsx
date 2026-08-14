import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { Search } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppModal } from '@/components/ui/Modal';
import { FilterDropdown, type FilterOption } from '@/components/ui/FilterDropdown';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { formatNGN } from '@/utils/money';
import { useGetSalesHistoryQuery } from '@/api/orderApi';
import type { ISalesRecord } from '@/types/order';

const STATUS_FILTERS: FilterOption[] = [
  { label: 'All', value: '' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Cancelled', value: 'canceled' },
];

function parseDate(value: string): Date | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export default function SalesHistoryScreen() {
  const { colors, spacing } = useAppTheme();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedSale, setSelectedSale] = useState<ISalesRecord | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useGetSalesHistoryQuery({
    page,
    limit: 20,
    status: status || undefined,
  });

  const query = search.trim().toLowerCase();
  const from = parseDate(fromDate);
  const to = parseDate(toDate);

  const visibleSales = (data?.items ?? []).filter((sale) => {
    if (query) {
      const matchesReference = sale.id.toLowerCase().includes(query);
      const matchesNotes = (sale.notes ?? '').toLowerCase().includes(query);
      if (!matchesReference && !matchesNotes) {
        return false;
      }
    }
    const created = new Date(sale.created_at);
    if (from && created < from) {
      return false;
    }
    if (to) {
      const endOfDay = new Date(to);
      endOfDay.setHours(23, 59, 59, 999);
      if (created > endOfDay) {
        return false;
      }
    }
    return true;
  });

  if (isError) {
    return (
      <View style={{ padding: spacing.xl, gap: spacing.md, alignItems: 'center' }}>
        <AppText center color={colors.textMuted}>
          Couldn&apos;t load sales history
        </AppText>
        <Button title="Try Again" onPress={refetch} fullWidth={false} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: spacing.md, gap: spacing.md }}>
        <Card padded={false} style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
          <Row style={{ gap: spacing.sm }}>
            <Search size={16} color={colors.textSubtle} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by order ID or notes..."
              placeholderTextColor={colors.textSubtle}
              style={{ flex: 1, fontSize: 14, color: colors.text }}
            />
          </Row>
        </Card>
        <Row style={{ gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <TextInput
              value={fromDate}
              onChangeText={(text) => setFromDate(text.replace(/[^0-9-]/g, ''))}
              placeholder="From YYYY-MM-DD"
              placeholderTextColor={colors.textSubtle}
              keyboardType="numbers-and-punctuation"
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 5,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                fontSize: 13,
                color: colors.text,
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              value={toDate}
              onChangeText={(text) => setToDate(text.replace(/[^0-9-]/g, ''))}
              placeholder="To YYYY-MM-DD"
              placeholderTextColor={colors.textSubtle}
              keyboardType="numbers-and-punctuation"
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 5,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                fontSize: 13,
                color: colors.text,
              }}
            />
          </View>
        </Row>
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
        items={visibleSales}
        pagination={data?.pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        isLoadingMore={isFetching && page > 1}
        onEndReached={() => setPage((p) => p + 1)}
        onRefresh={() => setPage(1)}
        keyExtractor={(item) => item.id}
        renderItem={(sale) => (
          <Card
            onPress={() => setSelectedSale(sale)}
            style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}
          >
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" color={colors.textMuted}>
                {new Date(sale.created_at).toLocaleString('en-NG', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </AppText>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="label" weight="medium" numberOfLines={1} style={{ flex: 1 }}>
                {sale.items?.[0]?.name ?? 'Sale'}
                {sale.items && sale.items.length > 1
                  ? ` +${sale.items.length - 1}`
                  : ''}
              </AppText>
              <AppText variant="label" weight="bold" color={colors.primary}>
                {formatNGN(sale.total)}
              </AppText>
            </Row>
            <Row style={{ gap: spacing.sm }}>
              {sale.staff_name ? (
                <AppText variant="small" color={colors.textMuted}>{sale.staff_name}</AppText>
              ) : null}
            </Row>
          </Card>
        )}
        emptyTitle="No sales yet"
        emptyDescription="Sales recorded at the terminal appear here"
      />
      <AppModal
        visible={Boolean(selectedSale)}
        onClose={() => setSelectedSale(null)}
        title="Sale Receipt"
        scrollable
      >
        {selectedSale ? (
          <View style={{ gap: spacing.md }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" color={colors.textMuted}>
                Order ID
              </AppText>
              <AppText variant="small" weight="semibold" numberOfLines={1} style={{ flex: 1, textAlign: 'right' }}>
                {selectedSale.id}
              </AppText>
            </Row>
            {(selectedSale.items ?? []).map((item, index) => (
              <Row
                key={`${item.product_id}-${index}`}
                style={{ justifyContent: 'space-between', gap: spacing.md }}
              >
                <AppText variant="small" numberOfLines={1} style={{ flex: 1 }}>
                  {item.name} × {item.quantity}
                </AppText>
                <AppText variant="small" weight="semibold">
                  {formatNGN(Number(item.price) * item.quantity)}
                </AppText>
              </Row>
            ))}
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" color={colors.textMuted}>
                Subtotal
              </AppText>
              <AppText variant="small">{formatNGN(selectedSale.subtotal)}</AppText>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="label" weight="bold">
                Total
              </AppText>
              <AppText variant="label" weight="bold" color={colors.primary}>
                {formatNGN(selectedSale.total)}
              </AppText>
            </Row>
            {selectedSale.notes ? (
              <AppText variant="small" color={colors.textMuted}>
                Notes: {selectedSale.notes}
              </AppText>
            ) : null}
            {selectedSale.staff_name ? (
              <AppText variant="small" color={colors.textMuted}>
                Recorded by {selectedSale.staff_name}
              </AppText>
            ) : null}
          </View>
        ) : null}
      </AppModal>
    </View>
  );
}

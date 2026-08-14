import { useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';

import { Receipt, Search, Wallet } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Chip, Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatNGN } from '@/utils/money';
import { useGetStoreCustomersQuery } from '@/api/storeApi';
import type { IVendorCustomer } from '@/types/store';

type SortKey = 'joined' | 'orders' | 'spent';
type SortDir = 'asc' | 'desc';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'joined', label: 'Date Joined' },
  { key: 'orders', label: 'Total Orders' },
  { key: 'spent', label: 'Amount Spent' },
];

function compareCustomers(a: IVendorCustomer, b: IVendorCustomer, key: SortKey): number {
  if (key === 'joined') {
    return (a.created_at ?? '').localeCompare(b.created_at ?? '');
  }
  if (key === 'orders') {
    return a.orders_count - b.orders_count;
  }
  return Number(a.total_spent) - Number(b.total_spent);
}

export default function VendorCustomersScreen() {
  const { colors, spacing } = useAppTheme();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('joined');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const { data, isLoading, isFetching, isError, refetch } = useGetStoreCustomersQuery({
    page,
    limit: 20,
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((current) => (current === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const query = search.trim().toLowerCase();
  const visibleCustomers = useMemo(() => {
    const filtered = (data?.items ?? []).filter((customer) => {
      if (!query) {
        return true;
      }
      const haystack = [
        customer.name,
        customer.email ?? '',
        customer.phone_number ?? '',
        customer.location ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
    const direction = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => direction * compareCustomers(a, b, sortKey));
  }, [data?.items, query, sortKey, sortDir]);

  if (isError) {
    return (
      <View style={{ padding: spacing.xl, gap: spacing.md, alignItems: 'center' }}>
        <AppText center color={colors.textMuted}>
          Couldn&apos;t load customers
        </AppText>
        <Button title="Try Again" onPress={refetch} fullWidth={false} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: spacing.md, gap: spacing.md }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <AppText variant="label" weight="bold">
            {data?.pagination.total ?? 0} customers
          </AppText>
        </Row>
        <Card padded={false} style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
          <Row style={{ gap: spacing.sm }}>
            <Search size={16} color={colors.textSubtle} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name, email, phone or location…"
              placeholderTextColor={colors.textSubtle}
              style={{ flex: 1, fontSize: 14, color: colors.text }}
            />
          </Row>
        </Card>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          {SORT_OPTIONS.map((option) => (
            <Chip
              key={option.key}
              label={`${option.label} ${sortKey === option.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}`}
              selected={sortKey === option.key}
              onPress={() => handleSort(option.key)}
            />
          ))}
        </View>
      </View>
      <PaginatedList
        items={visibleCustomers}
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
              <AppText variant="label" weight="semibold" numberOfLines={1} style={{ flex: 1 }}>
                {customer.name}
              </AppText>
              <StatusBadge status={customer.orders_count > 0 ? 'active' : 'inactive'} />
            </Row>
            {customer.email ? (
              <AppText variant="small" color={colors.textMuted} numberOfLines={1}>
                {customer.email}
              </AppText>
            ) : null}
            <Row style={{ gap: spacing.md }}>
              <Row style={{ gap: 4 }}>
                <Receipt size={14} color={colors.textSubtle} />
                <AppText variant="small" color={colors.textMuted}>
                  {customer.orders_count} orders
                </AppText>
              </Row>
              <Row style={{ gap: 4 }}>
                <Wallet size={14} color={colors.textSubtle} />
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

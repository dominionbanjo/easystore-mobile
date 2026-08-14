import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Spacer } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { StatsGrid } from '@/components/ui/StatsCard';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatNGNCompact, formatNGN } from '@/utils/money';
import {
  useGetOverviewAnalyticsQuery,
  useGetRecentSignupsQuery,
  useGetTopStoresQuery,
} from '@/api/adminApi';

function pctChange(current: number, previous: number): { pct: string; direction: 'up' | 'down' } | undefined {
  if (previous <= 0) {
    return current > 0 ? { pct: '100%', direction: 'up' } : undefined;
  }
  const delta = ((current - previous) / previous) * 100;
  if (Math.abs(delta) < 0.5) {
    return undefined;
  }
  return { pct: `${Math.abs(delta).toFixed(0)}%`, direction: delta >= 0 ? 'up' : 'down' };
}

export default function AdminOverviewScreen() {
  const { colors, spacing } = useAppTheme();

  const { data: stats, isLoading, isError: statsError, refetch: refetchStats } = useGetOverviewAnalyticsQuery();
  const { data: recentSignups, isError: signupsError, refetch: refetchSignups } = useGetRecentSignupsQuery({ limit: 5 });
  const { data: topStores, isError: storesError, refetch: refetchStores } = useGetTopStoresQuery({ limit: 5 });

  if (isLoading) {
    return (
      <View style={{ padding: spacing.lg }}>
        <ListSkeleton count={4} />
      </View>
    );
  }

  if (statsError || signupsError || storesError) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        <EmptyState
          title="Failed to load"
          description="Check your connection and try again"
          actionLabel="Try Again"
          onAction={() => {
            refetchStats();
            refetchSignups();
            refetchStores();
          }}
        />
      </View>
    );
  }

  const revenueTrend = stats ? pctChange(stats.revenue.thisMonth ?? 0, stats.revenue.lastMonth ?? 0) : undefined;
  const usersTrend = stats ? pctChange(stats.newUsers.thisMonth ?? 0, stats.newUsers.lastMonth ?? 0) : undefined;
  const ordersTrend = stats ? pctChange(stats.orders.thisMonth ?? 0, stats.orders.lastMonth ?? 0) : undefined;

  return (
    <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
      {stats ? (
        <StatsGrid
          items={[
            {
              label: 'Revenue (Month)',
              value: formatNGN(stats.revenue.thisMonth ?? 0),
              iconColor: 'primary',
              trend: revenueTrend?.pct,
              trendDirection: revenueTrend?.direction,
            },
            { label: 'Users', value: String(stats.totals.users ?? 0), iconColor: 'blue' },
            { label: 'Vendors', value: String(stats.totals.vendors ?? 0), iconColor: 'orange' },
            {
              label: 'Orders (Month)',
              value: String(stats.orders.thisMonth ?? 0),
              iconColor: 'green',
              trend: ordersTrend?.pct,
              trendDirection: ordersTrend?.direction,
            },
            { label: 'Pending Vendors', value: String(stats.pendingVendors ?? 0) },
            {
              label: 'New Users (Month)',
              value: String(stats.newUsers.thisMonth ?? 0),
              trend: usersTrend?.pct,
              trendDirection: usersTrend?.direction,
            },
          ]}
        />
      ) : null}

      {recentSignups && recentSignups.length > 0 ? (
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            Recent Signups
          </AppText>
          {recentSignups.map((signup) => (
            <View key={signup.id} style={{ gap: 2 }}>
              <AppText variant="small" weight="medium" numberOfLines={1}>
                {signup.first_name} {signup.last_name}
              </AppText>
              <AppText variant="small" color={colors.textMuted} numberOfLines={1}>
                {signup.email} · {signup.account_type} ·{' '}
                {new Date(signup.created_at).toLocaleDateString('en-NG')}
              </AppText>
            </View>
          ))}
        </Card>
      ) : null}

      {topStores && topStores.length > 0 ? (
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            Top Stores
          </AppText>
          {topStores.map((store, index) => (
            <View key={store.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText variant="small" numberOfLines={1} style={{ flex: 1 }}>
                {index + 1}. {store.store_name}
              </AppText>
              <AppText variant="small" weight="semibold" color={colors.primary}>
                {formatNGNCompact(store.total_revenue ?? 0)}
              </AppText>
            </View>
          ))}
        </Card>
      ) : null}
      <Spacer height={16} />
    </View>
  );
}

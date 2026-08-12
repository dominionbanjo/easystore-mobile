import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Spacer } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { StatsGrid } from '@/components/ui/StatsCard';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { formatNGNCompact, formatNGN } from '@/utils/money';
import {
  useGetOverviewAnalyticsQuery,
  useGetRecentSignupsQuery,
  useGetTopStoresQuery,
} from '@/api/adminApi';

export default function AdminOverviewScreen() {
  const { colors, spacing } = useAppTheme();

  const { data: stats, isLoading } = useGetOverviewAnalyticsQuery();
  const { data: recentSignups } = useGetRecentSignupsQuery({ limit: 5 });
  const { data: topStores } = useGetTopStoresQuery({ limit: 5 });

  if (isLoading) {
    return (
      <View style={{ padding: spacing.lg }}>
        <ListSkeleton count={4} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
      {stats ? (
        <StatsGrid
          items={[
            { label: 'Total Revenue', value: formatNGN(stats.total_revenue ?? 0), iconColor: 'primary' },
            { label: 'Users', value: String(stats.total_users ?? 0), iconColor: 'blue' },
            { label: 'Vendors', value: String(stats.total_vendors ?? 0), iconColor: 'orange' },
            { label: 'Orders', value: String(stats.total_orders ?? 0), iconColor: 'green' },
            { label: 'Pending Orders', value: String(stats.pending_orders ?? 0) },
            { label: 'Escrow Balance', value: formatNGNCompact(stats.escrow_balance ?? 0) },
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
              <AppText variant="small" weight="medium">
                {signup.first_name} {signup.last_name}
              </AppText>
              <AppText variant="small" color={colors.textMuted}>
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

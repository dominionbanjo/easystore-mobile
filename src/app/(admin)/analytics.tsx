import { View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { formatNGNCompact } from '@/utils/money';
import {
  useGetGrowthAnalyticsQuery,
  useGetRevenueAnalyticsQuery,
  useGetUserDistributionQuery,
  useGetRecentSignupsQuery,
  useGetTopStoresQuery,
} from '@/api/adminApi';

export default function AdminAnalyticsScreen() {
  const { colors, spacing } = useAppTheme();

  const growth = useGetGrowthAnalyticsQuery({ months: 12 });
  const revenue = useGetRevenueAnalyticsQuery({ months: 12 });
  const distribution = useGetUserDistributionQuery();
  const signups = useGetRecentSignupsQuery({ limit: 10 });
  const topStores = useGetTopStoresQuery({ limit: 10 });

  const isLoading =
    growth.isLoading || revenue.isLoading || distribution.isLoading ||
    signups.isLoading || topStores.isLoading;

  if (isLoading) {
    return (
      <View style={{ padding: spacing.lg }}>
        <ListSkeleton count={3} />
      </View>
    );
  }

  const revenueData = (revenue.data ?? []).map((point, index) => ({
    value: (point.revenue ?? 0) / 100,
    label: new Date(point.month).toLocaleDateString('en-NG', { month: 'short' }),
    index,
  }));

  const growthData = (growth.data ?? []).map((point, index) => ({
    value: point.users ?? 0,
    label: new Date(point.month).toLocaleDateString('en-NG', { month: 'short' }),
    index,
  }));

  return (
    <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
      <Card style={{ gap: spacing.sm }}>
        <AppText variant="label" weight="bold">
          Revenue (₦) — 12 months
        </AppText>
        {revenueData.length > 0 ? (
          <LineChart
            data={revenueData}
            height={180}
            curved
            color={colors.primary}
            thickness={2}
            hideDataPoints
            yAxisTextStyle={{ color: colors.textSubtle, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.textSubtle, fontSize: 10 }}
            yAxisColor={colors.border}
            xAxisColor={colors.border}
          />
        ) : (
          <AppText variant="small" color="gray">
            No revenue data yet
          </AppText>
        )}
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <AppText variant="label" weight="bold">
          User Growth — 12 months
        </AppText>
        {growthData.length > 0 ? (
          <LineChart
            data={growthData}
            height={160}
            curved
            color="#2563eb"
            thickness={2}
            hideDataPoints
            yAxisTextStyle={{ color: colors.textSubtle, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.textSubtle, fontSize: 10 }}
            yAxisColor={colors.border}
            xAxisColor={colors.border}
          />
        ) : (
          <AppText variant="small" color="gray">
            No growth data yet
          </AppText>
        )}
      </Card>

      {distribution.data ? (
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            User Distribution
          </AppText>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="small">Users</AppText>
            <AppText variant="small" weight="bold">{distribution.data.users}</AppText>
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="small">Vendors</AppText>
            <AppText variant="small" weight="bold">{distribution.data.vendors}</AppText>
          </Row>
        </Card>
      ) : null}

      {topStores.data && topStores.data.length > 0 ? (
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            Top Stores
          </AppText>
          {topStores.data.map((store, index) => (
            <Row key={store.id} style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" numberOfLines={1} style={{ flex: 1 }}>
                {index + 1}. {store.store_name}
              </AppText>
              <AppText variant="small" weight="semibold" color={colors.primary}>
                {formatNGNCompact(store.total_revenue ?? 0)}
              </AppText>
            </Row>
          ))}
        </Card>
      ) : null}
      <Spacer height={16} />
    </View>
  );
}

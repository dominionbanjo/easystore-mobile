import { View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { formatNGNCompact } from '@/utils/money';
import { useGetStoreAnalyticsQuery } from '@/api/storeApi';

export default function AnalyticsScreen() {
  const { colors, spacing } = useAppTheme();
  const { data: analytics, isLoading } = useGetStoreAnalyticsQuery();

  if (isLoading) {
    return (
      <View style={{ padding: spacing.lg }}>
        <ListSkeleton count={3} />
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={{ padding: spacing.xl }}>
        <AppText center color={colors.textMuted}>
          No analytics available yet
        </AppText>
      </View>
    );
  }

  const monthly = analytics.trends?.monthly ?? [];
  const chartData = monthly.map((point, index) => ({
    value: point.revenue / 100,
    label: new Date(point.month).toLocaleDateString('en-NG', { month: 'short' }),
    index,
  }));

  return (
    <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
      <Card style={{ gap: spacing.sm }}>
        <AppText variant="label" weight="bold">
          Monthly Revenue (₦)
        </AppText>
        {chartData.length > 0 ? (
          <LineChart
            data={chartData}
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
          <AppText variant="small" color={colors.textMuted}>
            No monthly data yet
          </AppText>
        )}
      </Card>

      {analytics.top_products && analytics.top_products.length > 0 ? (
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            Top Products
          </AppText>
          {analytics.top_products.slice(0, 5).map((product, index) => (
            <Row key={product.id} style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" numberOfLines={1} style={{ flex: 1 }}>
                {index + 1}. {product.name}
              </AppText>
              <AppText variant="small" weight="semibold" color={colors.primary}>
                {formatNGNCompact(product.revenue)}
              </AppText>
            </Row>
          ))}
        </Card>
      ) : null}

      {analytics.customers && analytics.customers.length > 0 ? (
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            Top Customers
          </AppText>
          {analytics.customers.slice(0, 5).map((customer) => (
            <Row key={customer.id} style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" numberOfLines={1} style={{ flex: 1 }}>
                {customer.name}
              </AppText>
              <AppText variant="small" weight="semibold">
                {customer.orders_count} orders · {formatNGNCompact(customer.total_spent)}
              </AppText>
            </Row>
          ))}
        </Card>
      ) : null}
      <Spacer height={16} />
    </View>
  );
}

import { View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AppImage } from '@/components/shared/AppImage';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { formatNGNCompact } from '@/utils/money';
import { useGetStoreAnalyticsQuery } from '@/api/storeApi';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function AnalyticsScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const { data: analytics, isLoading, isError, refetch } = useGetStoreAnalyticsQuery();

  if (isLoading) {
    return (
      <View style={{ padding: spacing.lg }}>
        <ListSkeleton count={3} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ padding: spacing.xl, gap: spacing.md, alignItems: 'center' }}>
        <AppText center color={colors.textMuted}>
          No analytics available yet
        </AppText>
        <Button title="Try Again" onPress={refetch} fullWidth={false} />
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
  const chartData = monthly.map((point, index) => {
    const month = Number(point.month);
    const label =
      Number.isFinite(month) && month >= 1 && month <= 12 ? MONTH_LABELS[month - 1] : '';
    return {
      value: Number(point.revenue) / 100,
      label,
      index,
    };
  });

  const topProducts = analytics.top_products ?? [];
  const topCustomers = analytics.customers ?? [];

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

      {topProducts.length > 0 ? (
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            Top Products
          </AppText>
          {topProducts.slice(0, 5).map((product, index) => (
            <Row key={product.product_id} style={{ gap: spacing.md }}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: radius.full,
                  backgroundColor: colors.surfaceAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppText style={{ fontSize: 10 }} weight="bold" color={colors.textMuted}>
                  {index + 1}
                </AppText>
              </View>
              <AppImage
                uri={product.image?.url}
                style={{ width: 36, height: 36 }}
                fallbackText={product.name}
              />
              <AppText variant="small" numberOfLines={1} style={{ flex: 1 }}>
                {product.name}
              </AppText>
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <AppText variant="small" weight="semibold" color={colors.primary}>
                  {formatNGNCompact(product.total_revenue)}
                </AppText>
                <AppText variant="small" color={colors.textSubtle}>
                  {Number(product.total_sold)} units
                </AppText>
              </View>
            </Row>
          ))}
        </Card>
      ) : (
        <Card style={{ gap: spacing.xs }}>
          <AppText variant="label" weight="bold">
            Top Products
          </AppText>
          <AppText variant="small" color={colors.textMuted}>
            No sales data yet
          </AppText>
        </Card>
      )}

      {topCustomers.length > 0 ? (
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            Top Customers
          </AppText>
          {topCustomers.slice(0, 5).map((customer) => (
            <Row key={customer.id} style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" numberOfLines={1} style={{ flex: 1 }}>
                {customer.name}
              </AppText>
              <AppText variant="small" weight="semibold">
                {customer.orders} orders · {formatNGNCompact(customer.spent)}
              </AppText>
            </Row>
          ))}
        </Card>
      ) : (
        <Card style={{ gap: spacing.xs }}>
          <AppText variant="label" weight="bold">
            Top Customers
          </AppText>
          <AppText variant="small" color={colors.textMuted}>
            No sales data yet
          </AppText>
        </Card>
      )}
      <Spacer height={16} />
    </View>
  );
}

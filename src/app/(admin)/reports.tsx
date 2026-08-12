import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { formatNGN } from '@/utils/money';
import {
  useGetGrowthAnalyticsQuery,
  useGetRevenueAnalyticsQuery,
  useGetUserDistributionQuery,
  useGetTransactionBreakdownQuery,
  useGetOrderBreakdownQuery,
  useGetSignupMethodsQuery,
} from '@/api/adminApi';

export default function AdminReportsScreen() {
  const { colors, spacing } = useAppTheme();

  const growth = useGetGrowthAnalyticsQuery({ months: 6 });
  const revenue = useGetRevenueAnalyticsQuery({ months: 6 });
  const distribution = useGetUserDistributionQuery();
  const breakdown = useGetTransactionBreakdownQuery();
  const orders = useGetOrderBreakdownQuery();
  const signups = useGetSignupMethodsQuery();

  const isLoading =
    growth.isLoading || revenue.isLoading || distribution.isLoading ||
    breakdown.isLoading || orders.isLoading || signups.isLoading;

  if (isLoading) {
    return (
      <View style={{ padding: spacing.lg }}>
        <ListSkeleton count={4} />
      </View>
    );
  }

  const growthItems = growth.data ?? [];
  const totalUsersGrowth = growthItems.reduce((sum, point) => sum + (point.users ?? 0), 0);
  const totalOrdersGrowth = growthItems.reduce((sum, point) => sum + (point.orders ?? 0), 0);

  return (
    <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
      <Card style={{ gap: spacing.sm }}>
        <AppText variant="label" weight="bold">
          Growth (last {growthItems.length} months)
        </AppText>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText variant="small" color="gray">
            Users
          </AppText>
          <AppText variant="small" weight="bold">
            {totalUsersGrowth}
          </AppText>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText variant="small" color="gray">
            Orders
          </AppText>
          <AppText variant="small" weight="bold">
            {totalOrdersGrowth}
          </AppText>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText variant="small" color="gray">
            Revenue
          </AppText>
          <AppText variant="small" weight="bold" color={colors.primary}>
            {formatNGN(
              revenue.data?.reduce((sum, point) => sum + (point.revenue ?? 0), 0) ?? 0,
            )}
          </AppText>
        </Row>
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <AppText variant="label" weight="bold">
          User Distribution
        </AppText>
        <MetricRow label="Users" value={String(distribution.data?.users ?? 0)} icon="person-outline" />
        <MetricRow label="Vendors" value={String(distribution.data?.vendors ?? 0)} icon="storefront-outline" />
        <MetricRow label="Staff" value={String(distribution.data?.staff ?? 0)} icon="briefcase-outline" />
        <MetricRow label="Admins" value={String(distribution.data?.admins ?? 0)} icon="shield-outline" />
      </Card>

      {breakdown.data ? (
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            Transaction Breakdown
          </AppText>
          {Object.entries(breakdown.data).map(([key, value]) => (
            <MetricRow key={key} label={key.replace(/_/g, ' ')} value={String(value)} icon="swap-horizontal-outline" />
          ))}
        </Card>
      ) : null}

      {orders.data ? (
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            Order Breakdown
          </AppText>
          {Object.entries(orders.data).map(([key, value]) => (
            <MetricRow key={key} label={key} value={String(value)} icon="receipt-outline" />
          ))}
        </Card>
      ) : null}

      {signups.data && signups.data.length > 0 ? (
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            Signup Methods
          </AppText>
          {signups.data.map((method) => (
            <MetricRow key={method.medium} label={method.medium} value={String(method.count)} icon="person-add-outline" />
          ))}
        </Card>
      ) : null}
      <Spacer height={16} />
    </View>
  );
}

function MetricRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const { colors, spacing } = useAppTheme();
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <Row style={{ gap: spacing.sm }}>
        <Ionicons name={icon} size={16} color={colors.textSubtle} />
        <AppText variant="small" style={{ textTransform: 'capitalize' }}>
          {label}
        </AppText>
      </Row>
      <AppText variant="small" weight="bold">
        {value}
      </AppText>
    </Row>
  );
}

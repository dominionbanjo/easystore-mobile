import { View } from 'react-native';
import { ArrowLeftRight, Receipt, UserPlus, Users } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
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

  const isError =
    growth.isError || revenue.isError || distribution.isError ||
    breakdown.isError || orders.isError || signups.isError;

  if (isError) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        <EmptyState
          title="Failed to load"
          description="Check your connection and try again"
          actionLabel="Try Again"
          onAction={() => {
            growth.refetch();
            revenue.refetch();
            distribution.refetch();
            breakdown.refetch();
            orders.refetch();
            signups.refetch();
          }}
        />
      </View>
    );
  }

  const growthItems = growth.data ?? [];
  const latest = growthItems[growthItems.length - 1];

  return (
    <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
      <Card style={{ gap: spacing.sm }}>
        <AppText variant="label" weight="bold">
          Growth (last {growthItems.length} months)
        </AppText>
        <AppText variant="small" color="gray">
          Latest month: Users / Orders
        </AppText>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText variant="small" color="gray">
            Users
          </AppText>
          <AppText variant="small" weight="bold">
            {latest?.users ?? 0}
          </AppText>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText variant="small" color="gray">
            Orders
          </AppText>
          <AppText variant="small" weight="bold">
            {latest?.orders ?? 0}
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
        {(distribution.data ?? []).map((item) => (
          <MetricRow key={item.name} label={item.name} value={String(item.value)} icon={Users} />
        ))}
      </Card>

      {breakdown.data && breakdown.data.length > 0 ? (
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            Transaction Breakdown
          </AppText>
          {breakdown.data.map((item) => (
            <MetricRow
              key={item.name}
              label={item.name}
              value={`${item.count} · ${formatNGN(item.total)}`}
              icon={ArrowLeftRight}
            />
          ))}
        </Card>
      ) : null}

      {orders.data && orders.data.length > 0 ? (
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            Order Breakdown
          </AppText>
          {orders.data.map((item) => (
            <MetricRow
              key={item.name}
              label={item.name}
              value={`${item.count} · ${formatNGN(item.totalAmount)}`}
              icon={Receipt}
            />
          ))}
        </Card>
      ) : null}

      {signups.data && signups.data.length > 0 ? (
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            Signup Methods
          </AppText>
          {signups.data.map((method) => (
            <MetricRow key={method.name} label={method.name} value={String(method.value)} icon={UserPlus} />
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
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  const { colors, spacing } = useAppTheme();
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <Row style={{ gap: spacing.sm }}>
        <Icon size={16} color={colors.textSubtle} strokeWidth={2} />
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

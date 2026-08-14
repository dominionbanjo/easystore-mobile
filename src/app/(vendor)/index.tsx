import {
  TrendingUp,
  ChevronRight,
  ShoppingCart,
  PlusCircle,
  Receipt,
  AlertTriangle,
  Store,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { useRouter } from 'expo-router';


import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatsGrid } from '@/components/ui/StatsCard';
import { Skeleton, ListSkeleton } from '@/components/ui/Skeleton';
import { formatNGN } from '@/utils/money';
import { useGetStoreAnalyticsQuery, useGetMyStoreQuery } from '@/api/storeApi';
import { useGetStaffSummaryQuery } from '@/api/staffApi';
import { useAppSelector } from '@/hooks';

export default function VendorOverviewScreen() {
  const { colors, radius, spacing, isDark } = useAppTheme();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const {
    data: analytics,
    isLoading,
    isError,
    refetch,
  } = useGetStoreAnalyticsQuery();
  const { data: store, isLoading: storeLoading } = useGetMyStoreQuery();
  const { data: staffSummary } = useGetStaffSummaryQuery(undefined, {
    skip: false,
  });

  const summary = analytics?.summary;
  const needsAttention = Boolean(
    summary && (summary.out_of_stock_count > 0 || summary.pending_orders_count > 0),
  );

  return (
    <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
      <AppText variant="body" color={colors.textMuted} style={{ fontWeight: '500' }}>
        Welcome back, {user?.first_name || 'Merchant'}. Here&apos;s what&apos;s happening today.
      </AppText>

      {store ? (
        <>
          {store.status === 'pending' ? (
            <Banner
              tone="warning"
              text="Your store is under review — you can keep adding products"
            />
          ) : null}
          {store.status === 'restricted' ? (
            <Banner tone="danger" text="Your store is restricted — contact eazystore support" />
          ) : null}
          <Card style={{ gap: spacing.xs }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="subtitle" weight="bold" style={{ flex: 1 }} numberOfLines={1}>
                {store.store_name}
              </AppText>
              {store.escrow_enabled ? (
                <AppText variant="small" color={colors.primary}>
                  Escrow ON
                </AppText>
              ) : null}
            </Row>
            <AppText variant="small" color={colors.textMuted}>
              {store.status === 'pending'
                ? 'Store pending approval'
                : store.setup_stage >= 4
                  ? 'Store ready'
                  : 'Complete store setup'}
            </AppText>
          </Card>
          {store.setup_stage < 4 ? (
            <Card
              onPress={() => router.push('/vendor/settings')}
              style={{ gap: spacing.xs, backgroundColor: isDark ? 'rgba(245,158,11,0.08)' : '#fffbeb' }}
            >
              <Row style={{ gap: spacing.sm }}>
                <AlertTriangle size={16} color={colors.warning} />
                <AppText variant="small" weight="medium" color={colors.text} style={{ flex: 1 }}>
                  Complete your store setup — visit Store Settings
                </AppText>
              </Row>
            </Card>
          ) : null}
        </>
      ) : !storeLoading ? (
        <Card style={{ gap: spacing.md, alignItems: 'center', padding: spacing.xl }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: radius.full,
              backgroundColor: colors.primaryMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Store size={26} color={colors.primary} />
          </View>
          <AppText variant="subtitle" weight="bold" center>
            Create your first store
          </AppText>
          <AppText variant="small" color={colors.textMuted} center>
            Start selling to customers across the country in minutes.
          </AppText>
          <Button title="Go to Store Settings" onPress={() => router.push('/vendor/settings')} />
        </Card>
      ) : null}

      {isLoading ? (
        <>
          <ListSkeleton count={2} />
          <Skeleton height={160} borderRadius={radius.xl} />
        </>
      ) : summary ? (
        <>
          <StatsGrid
            items={[
              { label: 'Total Revenue', value: formatNGN(summary.total_sales), iconColor: 'primary' },
              { label: 'Total Orders', value: String(summary.orders), iconColor: 'orange' },
              { label: 'Products', value: String(summary.total_products), iconColor: 'emerald' },
              { label: 'Customers', value: String(summary.customers), iconColor: 'blue' },
            ]}
          />
          {staffSummary ? (
            <StatsGrid
              columns={3}
              items={[
                { label: "Today's Sales", value: formatNGN(staffSummary.today_sales) },
                { label: "Today's Orders", value: String(staffSummary.today_orders) },
                { label: 'Low Stock', value: String(staffSummary.low_stock_count) },
              ]}
            />
          ) : null}

          {needsAttention ? (
            <Card style={{ gap: spacing.sm }}>
              <Row style={{ gap: spacing.sm }}>
                <AlertTriangle size={18} color={colors.warning} />
                <AppText variant="label" weight="bold">
                  Needs Attention
                </AppText>
              </Row>
              {summary.out_of_stock_count > 0 ? (
                <QuickAction
                  label={`Out of stock: ${summary.out_of_stock_count} products`}
                  icon={AlertTriangle}
                  onPress={() => router.push('/vendor/products')}
                />
              ) : null}
              {summary.pending_orders_count > 0 ? (
                <QuickAction
                  label={`Pending orders: ${summary.pending_orders_count}`}
                  icon={Receipt}
                  onPress={() => router.push('/vendor/orders')}
                />
              ) : null}
            </Card>
          ) : null}

          <Card style={{ gap: spacing.sm }}>
            <Row style={{ gap: spacing.sm }}>
              <TrendingUp size={18} color={colors.primary} />
              <AppText variant="label" weight="bold">
                Quick Actions
              </AppText>
            </Row>
            <QuickAction
              label="Record a sale (POS)"
              icon={ShoppingCart}
              onPress={() => router.push('/vendor/pos')}
            />
            <QuickAction
              label="Add a product"
              icon={PlusCircle}
              onPress={() => router.push('/vendor/product-new')}
            />
            <QuickAction
              label="View orders"
              icon={Receipt}
              onPress={() => router.push('/vendor/orders')}
            />
          </Card>
        </>
      ) : isError ? (
        <View style={{ gap: spacing.md, alignItems: 'center' }}>
          <AppText color={colors.textMuted} center>
            No analytics available yet
          </AppText>
          <Button title="Try Again" onPress={refetch} fullWidth={false} />
        </View>
      ) : (
        <AppText color={colors.textMuted} center>
          No analytics available yet
        </AppText>
      )}
    </View>
  );
}

function Banner({ text, tone }: { text: string; tone: 'warning' | 'danger' }) {
  const { radius, spacing, isDark } = useAppTheme();
  const backgroundColor =
    tone === 'warning'
      ? isDark
        ? 'rgba(245,158,11,0.15)'
        : '#fef3c7'
      : isDark
        ? 'rgba(239,68,68,0.15)'
        : '#fee2e2';
  const foreground = tone === 'warning' ? (isDark ? '#fbbf24' : '#b45309') : isDark ? '#f87171' : '#b91c1c';
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor,
        borderRadius: radius.md,
        padding: spacing.md,
      }}
    >
      <AlertTriangle size={16} color={foreground} />
      <AppText variant="small" weight="medium" color={foreground} style={{ flex: 1 }}>
        {text}
      </AppText>
    </View>
  );
}

function QuickAction({
  label,
  icon: Icon,
  onPress,
}: {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
}) {
  const { colors, spacing } = useAppTheme();
  return (
    <Card
      onPress={onPress}
      padded={false}
      style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.md }}
    >
      <Row style={{ gap: spacing.md }}>
        <Icon size={20} color={colors.primary} strokeWidth={2} />
        <AppText variant="label" weight="medium" style={{ flex: 1 }} numberOfLines={1}>
          {label}
        </AppText>
        <ChevronRight size={16} color={colors.textSubtle} />
      </Row>
    </Card>
  );
}

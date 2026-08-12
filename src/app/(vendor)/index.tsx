import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { StatsGrid } from '@/components/ui/StatsCard';
import { Skeleton, ListSkeleton } from '@/components/ui/Skeleton';
import { formatNGN } from '@/utils/money';
import { useGetStoreAnalyticsQuery , useGetMyStoreQuery } from '@/api/storeApi';
import { useGetStaffSummaryQuery } from '@/api/staffApi';

export default function VendorOverviewScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();

  const { data: analytics, isLoading } = useGetStoreAnalyticsQuery();
  const { data: store } = useGetMyStoreQuery();
  const { data: staffSummary } = useGetStaffSummaryQuery(undefined, {
    skip: false,
  });

  const summary = analytics?.summary;

  return (
    <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
      {store ? (
        <Card style={{ gap: spacing.xs }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="subtitle" weight="bold" style={{ flex: 1 }}>
              {store.store_name}
            </AppText>
            {store.escrow_enabled ? (
              <AppText variant="small" color={colors.primary}>
                Escrow ON
              </AppText>
            ) : null}
          </Row>
          <AppText variant="small" color={colors.textMuted}>
            {store.status === 'pending' ? 'Store pending approval' : store.setup_stage === 'completed' ? 'Store ready' : 'Complete store setup'}
          </AppText>
        </Card>
      ) : null}

      {isLoading ? (
        <>
          <ListSkeleton count={2} />
          <Skeleton height={160} borderRadius={12} />
        </>
      ) : summary ? (
        <>
          <StatsGrid
            items={[
              { label: 'Total Sales', value: formatNGN(summary.total_sales), accent: true },
              { label: 'Orders', value: String(summary.orders) },
              { label: 'Products', value: String(summary.total_products) },
              { label: 'Customers', value: String(summary.customers) },
              {
                label: 'Pending Orders',
                value: String(summary.pending_orders_count),
                sublabel: summary.pending_orders_count > 0 ? 'Needs attention' : undefined,
              },
              {
                label: 'Out of Stock',
                value: String(summary.out_of_stock_count),
                sublabel: summary.out_of_stock_count > 0 ? 'Restock soon' : undefined,
              },
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

          <Card style={{ gap: spacing.sm }}>
            <Row style={{ gap: spacing.sm }}>
              <Ionicons name="trending-up" size={18} color={colors.primary} />
              <AppText variant="label" weight="bold">
                Quick Actions
              </AppText>
            </Row>
            <QuickAction
              label="Record a sale (POS)"
              icon="cart-outline"
              onPress={() => router.push('/vendor/pos')}
            />
            <QuickAction
              label="Add a product"
              icon="add-circle-outline"
              onPress={() => router.push('/vendor/product-new')}
            />
            <QuickAction
              label="View orders"
              icon="receipt-outline"
              onPress={() => router.push('/vendor/orders')}
            />
          </Card>
        </>
      ) : (
        <AppText color={colors.textMuted} center>
          No analytics available yet
        </AppText>
      )}
    </View>
  );
}

function QuickAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
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
        <Ionicons name={icon} size={20} color={colors.primary} />
        <AppText variant="label" weight="medium">
          {label}
        </AppText>
        <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} style={{ marginLeft: 'auto' }} />
      </Row>
    </Card>
  );
}

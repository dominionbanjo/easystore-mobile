import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { API_BASE_URL } from '@/constants/api';
import { useGetOverviewAnalyticsQuery } from '@/api/adminApi';
import { formatNGN } from '@/utils/money';

export default function AdminSettingsScreen() {
  const { colors, spacing } = useAppTheme();
  const { data: stats } = useGetOverviewAnalyticsQuery();

  return (
    <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
      <Card style={{ gap: spacing.sm }}>
        <AppText variant="label" weight="bold">
          Platform
        </AppText>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText variant="small" color="gray">
            API endpoint
          </AppText>
          <AppText variant="small" weight="medium">
            {API_BASE_URL}
          </AppText>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText variant="small" color="gray">
            App version
          </AppText>
          <AppText variant="small" weight="medium">
            v1.0.0
          </AppText>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText variant="small" color="gray">
            Environment
          </AppText>
          <AppText variant="small" weight="medium" color={colors.primary}>
            Production
          </AppText>
        </Row>
      </Card>

      {stats ? (
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            Platform Snapshot
          </AppText>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="small" color="gray">
              Total revenue
            </AppText>
            <AppText variant="small" weight="bold">
              {formatNGN(stats.total_revenue ?? 0)}
            </AppText>
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="small" color="gray">
              Escrow balance
            </AppText>
            <AppText variant="small" weight="bold">
              {formatNGN(stats.escrow_balance ?? 0)}
            </AppText>
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="small" color="gray">
              Pending payouts
            </AppText>
            <AppText variant="small" weight="bold">
              {stats.pending_payouts ?? 0}
            </AppText>
          </Row>
        </Card>
      ) : null}
      <Spacer height={16} />
    </View>
  );
}

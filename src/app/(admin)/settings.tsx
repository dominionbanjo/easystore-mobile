import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { API_BASE_URL } from '@/constants/api';
import { useGetOverviewAnalyticsQuery } from '@/api/adminApi';

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
            {__DEV__ ? 'Development' : 'Production'}
          </AppText>
        </Row>
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <AppText variant="label" weight="bold">
          Platform settings
        </AppText>
        <AppText variant="small" color="gray">
          Platform-wide configuration is managed on the web admin dashboard. This screen is
          read-only for reference.
        </AppText>
      </Card>

      {stats ? (
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            Platform Snapshot
          </AppText>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="small" color="gray">
              Total users
            </AppText>
            <AppText variant="small" weight="bold">
              {stats.totals.users ?? 0}
            </AppText>
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="small" color="gray">
              Total stores
            </AppText>
            <AppText variant="small" weight="bold">
              {stats.totals.stores ?? 0}
            </AppText>
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="small" color="gray">
              Total orders
            </AppText>
            <AppText variant="small" weight="bold">
              {stats.totals.orders ?? 0}
            </AppText>
          </Row>
        </Card>
      ) : null}
      <Spacer height={16} />
    </View>
  );
}

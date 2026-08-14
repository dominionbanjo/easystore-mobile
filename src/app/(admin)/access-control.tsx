import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Card, Badge } from '@/components/ui/Card';
import { ALL_PERMISSION_CODES, ROLE_PERMISSIONS } from '@/constants/permissions';

const ROLES: { role: string; label: string }[] = [
  { role: 'admin', label: 'Super Admin' },
  { role: 'vendor', label: 'Vendor' },
  { role: 'staff', label: 'Staff' },
  { role: 'user', label: 'Buyer' },
];

export default function AdminAccessControlScreen() {
  const { spacing } = useAppTheme();

  return (
    <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
      <Card style={{ gap: spacing.sm }}>
        <AppText variant="label" weight="bold">
          Role Permissions Reference
        </AppText>
        <AppText variant="small" color="gray">
          Permissions enforce what each role can do across the platform. Staff permissions can be
          customized per staff member from the vendor dashboard.
        </AppText>
      </Card>
      {ROLES.map(({ role, label }) => (
        <Card key={role} style={{ gap: spacing.sm }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="label" weight="bold">
              {label}
            </AppText>
            <Badge label={role} />
          </Row>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {(ROLE_PERMISSIONS[role] ?? []).map((permission) => (
              <Badge key={permission} label={permission} variant="muted" />
            ))}
          </View>
        </Card>
      ))}
      <Card style={{ gap: spacing.sm }}>
        <AppText variant="label" weight="bold">
          All Permission Codes
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {ALL_PERMISSION_CODES.map((permission) => (
            <Badge key={permission} label={permission} variant="info" />
          ))}
        </View>
      </Card>
    </View>
  );
}

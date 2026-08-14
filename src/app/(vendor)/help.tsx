import { Linking, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Package, Receipt, School, ShoppingCart, Users, Wallet } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const HELP_ITEMS: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: 'Record a sale',
    body: 'Open Sales Terminal from the menu, tap products (or scan a barcode), then complete the sale with cash, transfer, or POS.',
    icon: ShoppingCart,
  },
  {
    title: 'Add a product',
    body: 'Go to Add Product, fill in the details, upload images, and publish. Products are reviewed and published by eazystore.',
    icon: Package,
  },
  {
    title: 'Manage orders',
    body: 'Orders shows every order on your store. Update statuses as you process and fulfill them.',
    icon: Receipt,
  },
  {
    title: 'Invite staff',
    body: 'Staff lets you invite team members and control exactly what they can do with granular permissions.',
    icon: Users,
  },
  {
    title: 'Payouts & escrow',
    body: 'Enable escrow in Store Settings to hold funds until buyers confirm delivery. Payouts are made on completed orders.',
    icon: Wallet,
  },
  {
    title: 'School zones',
    body: 'Join or create school zones to sell to university communities near you.',
    icon: School,
  },
];

export default function VendorHelpScreen() {
  const { colors, radius, spacing } = useAppTheme();
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
      {HELP_ITEMS.map((item) => (
        <Card key={item.title} style={{ gap: spacing.sm }}>
          <Row style={{ gap: spacing.md }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: radius.sm,
                backgroundColor: colors.primaryMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <item.icon size={18} color={colors.primary} strokeWidth={2} />
            </View>
            <AppText variant="label" weight="bold">
              {item.title}
            </AppText>
          </Row>
          <AppText variant="small" color={colors.textMuted}>
            {item.body}
          </AppText>
        </Card>
      ))}
      <Spacer height={8} />
      <Card
        onPress={() => Linking.openURL('mailto:support@eazystore.com.ng')}
        style={{ gap: spacing.sm }}
      >
        <Row style={{ gap: spacing.md }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: radius.sm,
              backgroundColor: colors.primaryMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Mail size={18} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="label" weight="bold">
              Contact support
            </AppText>
            <AppText variant="small" color={colors.primary} numberOfLines={1}>
              support@eazystore.com.ng
            </AppText>
          </View>
        </Row>
      </Card>
      <Button title="Go to Sales Terminal" onPress={() => router.push('/vendor/pos')} />
      <Spacer height={16} />
    </View>
  );
}

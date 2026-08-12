import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const HELP_ITEMS: { title: string; body: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  {
    title: 'Record a sale',
    body: 'Open Sales Terminal from the menu, tap products (or scan a barcode), then complete the sale with cash, transfer, or POS.',
    icon: 'cart-outline',
  },
  {
    title: 'Add a product',
    body: 'Go to Add Product, fill in the details, upload images, and publish. Products go live instantly.',
    icon: 'cube-outline',
  },
  {
    title: 'Manage orders',
    body: 'Orders shows every order on your store. Update statuses as you process and fulfill them.',
    icon: 'receipt-outline',
  },
  {
    title: 'Invite staff',
    body: 'Staff lets you invite team members and control exactly what they can do with granular permissions.',
    icon: 'people-outline',
  },
  {
    title: 'Payouts & escrow',
    body: 'Enable escrow in Store Settings to hold funds until buyers confirm delivery. Payouts are made on completed orders.',
    icon: 'wallet-outline',
  },
  {
    title: 'School zones',
    body: 'Join or create school zones to sell to university communities near you.',
    icon: 'school-outline',
  },
];

export default function VendorHelpScreen() {
  const { spacing } = useAppTheme();
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
                borderRadius: 4,
                backgroundColor: 'rgba(23,192,110,0.1)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={item.icon} size={18} color="#17c06e" />
            </View>
            <AppText variant="label" weight="bold">
              {item.title}
            </AppText>
          </Row>
          <AppText variant="small" color="gray">
            {item.body}
          </AppText>
        </Card>
      ))}
      <Spacer height={8} />
      <Button title="Go to Sales Terminal" onPress={() => router.push('/vendor/pos')} />
      <Spacer height={16} />
    </View>
  );
}

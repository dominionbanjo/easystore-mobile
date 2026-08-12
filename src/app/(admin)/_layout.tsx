import { useState } from 'react';
import { Stack, Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { useAppTheme } from '@/theme';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { AppText } from '@/components/ui/Text';
import { AppModal } from '@/components/ui/Modal';
import { useLogoutMutation } from '@/api/authApi';
import { clearCredentials } from '@/features/authSlice';

interface AdminMenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
}

const ADMIN_MENU: AdminMenuItem[] = [
  { label: 'Overview', icon: 'grid-outline', href: '/admin' },
  { label: 'Users', icon: 'people-outline', href: '/admin/users' },
  { label: 'Vendors', icon: 'storefront-outline', href: '/admin/vendors' },
  { label: 'Orders', icon: 'receipt-outline', href: '/admin/orders' },
  { label: 'Transactions', icon: 'swap-horizontal-outline', href: '/admin/transactions' },
  { label: 'Payouts & Escrow', icon: 'wallet-outline', href: '/admin/payouts' },
  { label: 'Installments', icon: 'calendar-outline', href: '/admin/installments' },
  { label: 'School Zones', icon: 'school-outline', href: '/admin/school-zones' },
  { label: 'Broadcasts', icon: 'megaphone-outline', href: '/admin/broadcasts' },
  { label: 'Notifications', icon: 'notifications-outline', href: '/admin/notifications' },
  { label: 'Reports', icon: 'document-text-outline', href: '/admin/reports' },
  { label: 'System Logs', icon: 'list-outline', href: '/admin/logs' },
  { label: 'Analytics', icon: 'stats-chart-outline', href: '/admin/analytics' },
  { label: 'Access Control', icon: 'shield-checkmark-outline', href: '/admin/access-control' },
  { label: 'Settings', icon: 'settings-outline', href: '/admin/settings' },
];

export default function AdminLayout() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logout] = useLogoutMutation();

  if (!isAuthenticated || !user) {
    return <Redirect href="/login" />;
  }
  if (user.account_type !== 'admin') {
    return <Redirect href={user.account_type === 'vendor' ? '/vendor' : user.account_type === 'staff' ? '/staff' : '/home'} />;
  }

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // ignore
    }
    dispatch(clearCredentials());
    router.replace('/home');
  };

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text },
          headerStyle: { backgroundColor: colors.background },
          headerRight: () => (
            <Pressable
              onPress={() => setMenuOpen(true)}
              hitSlop={8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.primaryMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="menu" size={20} color={colors.primary} />
            </Pressable>
          ),
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Platform Overview' }} />
        <Stack.Screen name="users" options={{ title: 'Users' }} />
        <Stack.Screen name="vendors" options={{ title: 'Vendors' }} />
        <Stack.Screen name="orders" options={{ title: 'Orders' }} />
        <Stack.Screen name="transactions" options={{ title: 'Transactions' }} />
        <Stack.Screen name="payouts" options={{ title: 'Payouts & Escrow' }} />
        <Stack.Screen name="installments" options={{ title: 'Installments' }} />
        <Stack.Screen name="school-zones" options={{ title: 'School Zones' }} />
        <Stack.Screen name="broadcasts" options={{ title: 'Broadcasts' }} />
        <Stack.Screen name="notifications" options={{ title: 'Automated Notifications' }} />
        <Stack.Screen name="reports" options={{ title: 'Reports' }} />
        <Stack.Screen name="logs" options={{ title: 'System Logs' }} />
        <Stack.Screen name="analytics" options={{ title: 'Analytics' }} />
        <Stack.Screen name="access-control" options={{ title: 'Access Control' }} />
        <Stack.Screen name="settings" options={{ title: 'Platform Settings' }} />
      </Stack>

      <AppModal
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={`EasyStore Admin`}
        scrollable
      >
        <View style={{ gap: spacing.xs }}>
          {ADMIN_MENU.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => {
                setMenuOpen(false);
                router.push(item.href as never);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.md,
                borderRadius: spacing.sm,
                backgroundColor: colors.surfaceAlt,
              }}
            >
              <Ionicons name={item.icon} size={20} color={colors.primary} />
              <AppText variant="label" weight="medium" style={{ flex: 1 }}>
                {item.label}
              </AppText>
              <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
            </Pressable>
          ))}
          <Pressable
            onPress={handleLogout}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.md,
              borderRadius: spacing.sm,
              backgroundColor: '#fee2e2',
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#b91c1c" />
            <AppText variant="label" weight="medium" color="#b91c1c">
              Sign Out
            </AppText>
          </Pressable>
        </View>
      </AppModal>
    </>
  );
}

import {
  ArrowLeftRight,
  BarChart3,
  CalendarDays,
  FileText,
  LayoutGrid,
  List,
  LogOut,
  Megaphone,
  Menu,
  MessageSquareText,
  Receipt,
  School,
  Settings,
  ShieldCheck,
  Store,
  Users,
  Wallet,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Stack, Redirect, useRouter } from 'expo-router';

import { Pressable, View } from 'react-native';

import { useAppTheme } from '@/theme';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { AppText, Row } from '@/components/ui/Text';
import { Drawer } from '@/components/ui/Drawer';
import { ConfirmDialog } from '@/components/ui/Modal';
import { MoreDrawerContent, type MoreDrawerRow } from '@/components/shared/MoreDrawerContent';
import { useLogoutMutation } from '@/api/authApi';
import { clearCredentials } from '@/features/authSlice';

interface AdminMenuItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const ADMIN_MENU: AdminMenuItem[] = [
  { label: 'Overview', icon: LayoutGrid, href: '/admin' },
  { label: 'Users', icon: Users, href: '/admin/users' },
  { label: 'Vendors', icon: Store, href: '/admin/vendors' },
  { label: 'Orders', icon: Receipt, href: '/admin/orders' },
  { label: 'Transactions', icon: ArrowLeftRight, href: '/admin/transactions' },
  { label: 'Payouts & Escrow', icon: Wallet, href: '/admin/payouts' },
  { label: 'Installments', icon: CalendarDays, href: '/admin/installments' },
  { label: 'School Zones', icon: School, href: '/admin/school-zones' },
  { label: 'Broadcasts', icon: Megaphone, href: '/admin/broadcasts' },
  { label: 'Notifications', icon: MessageSquareText, href: '/admin/notifications' },
  { label: 'Reports', icon: FileText, href: '/admin/reports' },
  { label: 'System Logs', icon: List, href: '/admin/logs' },
  { label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
  { label: 'Access Control', icon: ShieldCheck, href: '/admin/access-control' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

export default function AdminLayout() {
  const { colors, spacing } = useAppTheme();
  const isDark = useAppTheme().isDark;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();

  if (!isAuthenticated || !user) {
    return <Redirect href="/home" />;
  }
  if (user.account_type !== 'admin') {
    return <Redirect href={user.account_type === 'vendor' ? '/vendor' : user.account_type === 'staff' ? '/staff' : '/home'} />;
  }

  const handleLogout = async () => {
    setLogoutOpen(false);
    try {
      await logout().unwrap();
    } catch {
      // ignore
    }
    dispatch(clearCredentials());
  };

  const drawerRows: MoreDrawerRow[] = ADMIN_MENU.map((item) => ({
    label: item.label,
    icon: <item.icon size={20} color={colors.primary} strokeWidth={2} />,
    href: item.href,
  }));

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text, fontFamily: 'Outfit_700Bold' },
          headerStyle: { backgroundColor: colors.surface },
          headerRight: () => (
            <Row style={{ gap: 12 }}>
              <Pressable onPress={() => router.push('/messages')} hitSlop={8}>
                <MessageSquareText size={22} color={colors.text} />
              </Pressable>
              <Pressable
                onPress={() => setMenuOpen(true)}
                hitSlop={8}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.surfaceAlt,
                }}
              >
                <Menu size={18} color={colors.text} />
              </Pressable>
            </Row>
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

      <Drawer
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        side="left"
        title="eazystore Admin"
      >
        <MoreDrawerContent
          rows={drawerRows}
          onNavigate={(href) => {
            setMenuOpen(false);
            router.push(href as never);
          }}
          footer={
            <Pressable
              onPress={() => setLogoutOpen(true)}
              disabled={loggingOut}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.md,
                borderRadius: 4,
                backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : '#fee2e2',
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  backgroundColor: isDark ? 'rgba(239,68,68,0.2)' : '#fecaca',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LogOut size={18} color={isDark ? '#f87171' : '#b91c1c'} />
              </View>
              <AppText variant="label" weight="medium" color={isDark ? '#f87171' : '#b91c1c'}>
                Sign Out
              </AppText>
            </Pressable>
          }
        />
      </Drawer>

      <ConfirmDialog
        visible={logoutOpen}
        title="Sign out of eazystore?"
        message="You will need to sign in again to continue."
        confirmText="Sign Out"
        destructive
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </>
  );
}

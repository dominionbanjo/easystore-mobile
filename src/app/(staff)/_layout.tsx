import { Clock, LogOut, Menu, PlusCircle, Settings, ShoppingCart } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Stack, Redirect, useRouter } from 'expo-router';

import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { AppText } from '@/components/ui/Text';
import { BottomNav, NAV_HEIGHT, type BottomNavItem } from '@/components/ui/BottomNav';
import { Drawer } from '@/components/ui/Drawer';
import { ConfirmDialog } from '@/components/ui/Modal';
import { MoreDrawerContent, type MoreDrawerRow } from '@/components/shared/MoreDrawerContent';
import { useLogoutMutation } from '@/api/authApi';
import { clearCredentials } from '@/features/authSlice';
import { useGetStaffPermissionsQuery } from '@/api/staffApi';

interface MenuItem {
  label: string;
  icon: LucideIcon;
  href: string;
  permission?: string;
}

export default function StaffLayout() {
  const { colors, spacing } = useAppTheme();
  const isDark = useAppTheme().isDark;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();

  const { data: permissions } = useGetStaffPermissionsQuery(undefined, {
    skip: !isAuthenticated || user?.account_type !== 'staff',
  });

  if (!isAuthenticated || !user) {
    return <Redirect href="/home" />;
  }
  if (user.account_type !== 'staff') {
    return <Redirect href={user.account_type === 'vendor' ? '/vendor' : user.account_type === 'admin' ? '/admin' : '/home'} />;
  }

  const has = (permission?: string): boolean => {
    if (!permission) {
      return true;
    }
    return permissions?.permissions.includes(permission as never) ?? false;
  };

  const menu: MenuItem[] = [
    { label: 'Sales Terminal', icon: ShoppingCart, href: '/staff', permission: 'order:manage' },
    { label: 'Sales History', icon: Clock, href: '/staff/sales-history', permission: 'order:view' },
    { label: 'Add Product', icon: PlusCircle, href: '/staff/product-new', permission: 'product:create' },
    { label: 'Settings', icon: Settings, href: '/staff/settings' },
  ].filter((item) => has(item.permission)) as MenuItem[];

  const bottomNavItems: BottomNavItem[] = [
    {
      label: 'Terminal',
      icon: (focused) => <ShoppingCart size={20} color={focused ? colors.primary : colors.textMuted} strokeWidth={2} />,
      href: '/staff',
      exact: true,
    },
    {
      label: 'History',
      icon: (focused) => <Clock size={20} color={focused ? colors.primary : colors.textMuted} strokeWidth={2} />,
      href: '/staff/sales-history',
    },
    ...(has('product:create')
      ? [{
          label: 'Add Product',
          icon: (focused: boolean) => <PlusCircle size={20} color={focused ? colors.primary : colors.textMuted} strokeWidth={2} />,
          href: '/staff/product-new',
        }]
      : []),
    {
      label: 'Settings',
      icon: (focused) => <Settings size={20} color={focused ? colors.primary : colors.textMuted} strokeWidth={2} />,
      href: '/staff/settings',
    },
    {
      label: 'More',
      icon: (focused) => <Menu size={20} color={focused ? colors.primary : colors.textMuted} strokeWidth={2} />,
      href: '/more',
      isMore: true,
    },
  ];

  const drawerRows: MoreDrawerRow[] = menu.map((item) => ({
    label: item.label,
    icon: <item.icon size={20} color={colors.primary} strokeWidth={2} />,
    href: item.href,
  }));

  const handleLogout = async () => {
    setLogoutOpen(false);
    try {
      await logout().unwrap();
    } catch {
      // ignore
    }
    dispatch(clearCredentials());
  };

  return (
    <>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: true,
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.text },
            headerStyle: { backgroundColor: colors.background },
            contentStyle: { paddingBottom: NAV_HEIGHT + insets.bottom },
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
                <Menu size={20} color={colors.primary} />
              </Pressable>
            ),
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Sales Terminal', headerShown: false, contentStyle: { paddingBottom: 0 } }} />
          <Stack.Screen name="sales-history" options={{ title: 'Sales History' }} />
          <Stack.Screen name="product-new" options={{ title: 'Add Product' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        </Stack>

        <BottomNav
          items={bottomNavItems}
          onMorePress={() => setMenuOpen(true)}
          moreActive={menuOpen}
        />
      </View>

      <Drawer
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        side="right"
        title="Staff Menu"
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

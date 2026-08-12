import { useState } from 'react';
import { Stack, Redirect , useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { useAppTheme } from '@/theme';
import { useAppSelector , useAppDispatch } from '@/hooks';
import { AppText } from '@/components/ui/Text';
import { AppModal } from '@/components/ui/Modal';
import { useLogoutMutation } from '@/api/authApi';
import { clearCredentials } from '@/features/authSlice';

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
  permission?: string;
}

const VENDOR_MENU: MenuItem[] = [
  { label: 'Dashboard', icon: 'grid-outline', href: '/vendor' },
  { label: 'Products', icon: 'cube-outline', href: '/vendor/products', permission: 'product:view' },
  { label: 'Add Product', icon: 'add-circle-outline', href: '/vendor/product-new', permission: 'product:create' },
  { label: 'Orders', icon: 'receipt-outline', href: '/vendor/orders', permission: 'order:view' },
  { label: 'Customers', icon: 'people-outline', href: '/vendor/customers' },
  { label: 'Sales Terminal', icon: 'cart-outline', href: '/vendor/pos', permission: 'order:manage' },
  { label: 'Sales History', icon: 'time-outline', href: '/vendor/sales-history', permission: 'order:view' },
  { label: 'Staff', icon: 'briefcase-outline', href: '/vendor/staff', permission: 'store:manage' },
  { label: 'Payouts', icon: 'wallet-outline', href: '/vendor/payouts', permission: 'transaction:view' },
  { label: 'School Zones', icon: 'school-outline', href: '/vendor/school-zones' },
  { label: 'Analytics', icon: 'stats-chart-outline', href: '/vendor/analytics', permission: 'analytics:view' },
  { label: 'Messages', icon: 'chatbubbles-outline', href: '/messages' },
  { label: 'Store Settings', icon: 'settings-outline', href: '/vendor/settings', permission: 'store:manage' },
];

export default function VendorLayout() {
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
  if (user.account_type !== 'vendor') {
    return <Redirect href={user.account_type === 'staff' ? '/staff' : user.account_type === 'admin' ? '/admin' : '/home'} />;
  }

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // local cleanup always happens
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
        <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
        <Stack.Screen name="products" options={{ title: 'My Products' }} />
        <Stack.Screen name="product-new" options={{ title: 'Add Product' }} />
        <Stack.Screen name="product-edit/[id]" options={{ title: 'Edit Product' }} />
        <Stack.Screen name="orders" options={{ title: 'Orders' }} />
        <Stack.Screen name="customers" options={{ title: 'Customers' }} />
        <Stack.Screen name="staff" options={{ title: 'Staff' }} />
        <Stack.Screen name="pos" options={{ title: 'Sales Terminal', headerShown: false }} />
        <Stack.Screen name="sales-history" options={{ title: 'Sales History' }} />
        <Stack.Screen name="payouts" options={{ title: 'Payouts' }} />
        <Stack.Screen name="school-zones" options={{ title: 'School Zones' }} />
        <Stack.Screen name="analytics" options={{ title: 'Analytics' }} />
        <Stack.Screen name="settings" options={{ title: 'Store Settings' }} />
      </Stack>

      <AppModal
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={`EasyStore · ${user.first_name}`}
        scrollable
      >
        <View style={{ gap: spacing.xs }}>
          {VENDOR_MENU.map((item) => (
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

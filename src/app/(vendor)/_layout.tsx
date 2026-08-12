import { useState } from 'react';
import { Stack, Redirect , useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { useAppTheme } from '@/theme';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { AppText, Row } from '@/components/ui/Text';
import { AppModal } from '@/components/ui/Modal';
import { useLogoutMutation, useSwitchStoreMutation } from '@/api/authApi';
import { clearCredentials } from '@/features/authSlice';
import { useGetMyStoreQuery, useGetMyStoresQuery } from '@/api/storeApi';
import { useToast } from '@/hooks/useToast';

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
  permission?: string;
}

const VENDOR_MENU: MenuItem[] = [
  { label: 'Dashboard', icon: 'grid-outline', href: '/vendor' },
  { label: 'Products', icon: 'cube-outline', href: '/vendor/products', permission: 'product:view' },
  { label: 'Orders', icon: 'receipt-outline', href: '/vendor/orders', permission: 'order:view' },
  { label: 'Customers', icon: 'people-outline', href: '/vendor/customers' },
  { label: 'Staff', icon: 'person-circle-outline', href: '/vendor/staff', permission: 'store:manage' },
  { label: 'Sales Terminal', icon: 'cart-outline', href: '/vendor/pos', permission: 'order:manage' },
  { label: 'Sales History', icon: 'time-outline', href: '/vendor/sales-history', permission: 'order:view' },
  { label: 'School Zones', icon: 'school-outline', href: '/vendor/school-zones' },
  { label: 'Payouts', icon: 'wallet-outline', href: '/vendor/payouts', permission: 'transaction:view' },
  { label: 'Templates', icon: 'color-palette-outline', href: '/vendor/templates' },
  { label: 'Messages', icon: 'chatbubbles-outline', href: '/messages' },
  { label: 'Store Settings', icon: 'settings-outline', href: '/vendor/settings', permission: 'store:manage' },
  { label: 'Analytics', icon: 'bar-chart-outline', href: '/vendor/analytics', permission: 'analytics:view' },
  { label: 'Help', icon: 'help-circle-outline', href: '/vendor/help' },
  { label: 'Add Product', icon: 'add-circle-outline', href: '/vendor/product-new', permission: 'product:create' },
];

export default function VendorLayout() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logout] = useLogoutMutation();
  const [switchStore] = useSwitchStoreMutation();

  const { data: store } = useGetMyStoreQuery();
  const { data: myStores } = useGetMyStoresQuery();
  const [switchingStore, setSwitchingStore] = useState(false);

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

  const handleSwitchStore = async (storeId: string) => {
    setSwitchingStore(true);
    try {
      await switchStore({ store_id: storeId }).unwrap();
      toast.showSuccess('Store switched');
      setMenuOpen(false);
      router.replace('/vendor');
    } catch {
      toast.showError('Failed to switch store');
    } finally {
      setSwitchingStore(false);
    }
  };

  const avatarText = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`;

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text, fontFamily: 'Outfit_700Bold' },
          headerStyle: { backgroundColor: colors.surface },
          headerRight: () => (
            <Row style={{ gap: spacing.md }}>
              <Pressable onPress={() => router.push('/messages')} hitSlop={8}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.text} />
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
                <AppText style={{ fontSize: 13 }} weight="bold" color={colors.text}>
                  {avatarText}
                </AppText>
              </Pressable>
            </Row>
          ),
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
        <Stack.Screen name="products" options={{ title: 'Products' }} />
        <Stack.Screen name="product-new" options={{ title: 'Add Product' }} />
        <Stack.Screen name="product-edit/[id]" options={{ title: 'Edit Product' }} />
        <Stack.Screen name="orders" options={{ title: 'Orders' }} />
        <Stack.Screen name="customers" options={{ title: 'Customers' }} />
        <Stack.Screen name="staff" options={{ title: 'Staff' }} />
        <Stack.Screen name="pos" options={{ title: 'Sales Terminal', headerShown: false }} />
        <Stack.Screen name="sales-history" options={{ title: 'Sales History' }} />
        <Stack.Screen name="payouts" options={{ title: 'Payouts' }} />
        <Stack.Screen name="school-zones" options={{ title: 'School Zones' }} />
        <Stack.Screen name="templates" options={{ title: 'Templates' }} />
        <Stack.Screen name="analytics" options={{ title: 'Analytics' }} />
        <Stack.Screen name="settings" options={{ title: 'Store Settings' }} />
        <Stack.Screen name="help" options={{ title: 'Help' }} />
      </Stack>

      <AppModal
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Menu"
        scrollable
      >
        <View style={{ gap: spacing.xs }}>
          {myStores && myStores.length > 0 ? (
            <View style={{ gap: spacing.xs, marginBottom: spacing.sm }}>
              <AppText variant="small" weight="medium" color={colors.textSubtle}>
                ACTIVE STORE
              </AppText>
              {myStores.map((storeItem) => {
                const isActive = storeItem.id === store?.id;
                return (
                  <Pressable
                    key={storeItem.id}
                    disabled={isActive || switchingStore}
                    onPress={() => handleSwitchStore(storeItem.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.md,
                      paddingVertical: spacing.md,
                      paddingHorizontal: spacing.md,
                      borderRadius: 4,
                      backgroundColor: isActive ? 'rgba(23,192,110,0.1)' : colors.surfaceAlt,
                    }}
                  >
                    <Ionicons
                      name="storefront-outline"
                      size={20}
                      color={isActive ? '#17c06e' : colors.textMuted}
                    />
                    <AppText
                      variant="label"
                      weight={isActive ? 'bold' : 'medium'}
                      color={isActive ? '#17c06e' : colors.text}
                      style={{ flex: 1 }}
                    >
                      {storeItem.store_name}
                    </AppText>
                    {isActive ? (
                      <Ionicons name="checkmark-circle" size={18} color="#17c06e" />
                    ) : (
                      <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
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
                borderRadius: 4,
                backgroundColor: colors.surfaceAlt,
              }}
            >
              <Ionicons name={item.icon} size={20} color="#17c06e" />
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
              borderRadius: 4,
              backgroundColor: 'rgba(244,63,94,0.1)',
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#e11d48" />
            <AppText variant="label" weight="medium" color="#e11d48">
              Log out
            </AppText>
          </Pressable>
        </View>
      </AppModal>
    </>
  );
}

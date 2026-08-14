import {
  BarChart3,
  CheckCircle2,
  Package,
  CircleHelp,

  LayoutGrid,
  LogOut,
  Palette,
  PlusCircle,
  Receipt,
  School,
  Settings,
  ShoppingCart,
  Store,
  UserRound,
  Users,
  Wallet,
  MessageSquareText,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Stack, Redirect, useRouter } from 'expo-router';
import { Home as IconsaxHome, Tag, ShoppingCart as IconsaxCart, People, More as IconsaxMore } from 'iconsax-react-native';

import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { AppText, Row } from '@/components/ui/Text';
import { BottomNav, NAV_HEIGHT, type BottomNavItem } from '@/components/ui/BottomNav';
import { Drawer } from '@/components/ui/Drawer';
import { ConfirmDialog } from '@/components/ui/Modal';
import { MoreDrawerContent, type MoreDrawerRow } from '@/components/shared/MoreDrawerContent';
import { CreateStoreModal } from '@/components/shared/CreateStoreModal';
import { AppImage } from '@/components/shared/AppImage';
import { useLogoutMutation, useSwitchStoreMutation } from '@/api/authApi';
import { clearCredentials } from '@/features/authSlice';
import { useGetMyStoreQuery, useGetMyStoresQuery } from '@/api/storeApi';
import { useToast } from '@/hooks/useToast';

interface MenuItem {
  label: string;
  icon: LucideIcon;
  href: string;
  permission?: string;
}

const VENDOR_MENU: MenuItem[] = [
  { label: 'Dashboard', icon: LayoutGrid, href: '/vendor' },
  { label: 'Products', icon: Package, href: '/vendor/products', permission: 'product:view' },
  { label: 'Orders', icon: Receipt, href: '/vendor/orders', permission: 'order:view' },
  { label: 'Customers', icon: Users, href: '/vendor/customers' },
  { label: 'Staff', icon: UserRound, href: '/vendor/staff', permission: 'store:manage' },
  { label: 'Sales Terminal', icon: ShoppingCart, href: '/vendor/pos', permission: 'order:manage' },
  { label: 'Sales History', icon: CheckCircle2, href: '/vendor/sales-history', permission: 'order:view' },
  { label: 'School Zones', icon: School, href: '/vendor/school-zones' },
  { label: 'Payouts', icon: Wallet, href: '/vendor/payouts', permission: 'transaction:view' },
  { label: 'Templates', icon: Palette, href: '/vendor/templates' },
  { label: 'Messages', icon: MessageSquareText, href: '/messages' },
  { label: 'Store Settings', icon: Settings, href: '/vendor/settings', permission: 'store:manage' },
  { label: 'Analytics', icon: BarChart3, href: '/vendor/analytics', permission: 'analytics:view' },
  { label: 'Help', icon: CircleHelp, href: '/vendor/help' },
  { label: 'Add Product', icon: PlusCircle, href: '/vendor/product-new', permission: 'product:create' },
];

export default function VendorLayout() {
  const { colors, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();
  const [switchStore] = useSwitchStoreMutation();

  const { data: store } = useGetMyStoreQuery();
  const { data: myStores } = useGetMyStoresQuery();
  const [switchingStore, setSwitchingStore] = useState(false);

  const bottomNavItems: BottomNavItem[] = [
    {
      label: 'Home',
      icon: (focused) => <IconsaxHome variant={focused ? 'Bold' : 'Outline'} size={20} color={focused ? colors.primary : colors.textMuted} />,
      href: '/vendor',
      exact: true,
    },
    {
      label: 'Products',
      icon: (focused) => <Tag variant={focused ? 'Bold' : 'Outline'} size={20} color={focused ? colors.primary : colors.textMuted} />,
      href: '/vendor/products',
    },
    {
      label: 'Orders',
      icon: (focused) => <IconsaxCart variant={focused ? 'Bold' : 'Outline'} size={20} color={focused ? colors.primary : colors.textMuted} />,
      href: '/vendor/orders',
    },
    {
      label: 'Customers',
      icon: (focused) => <People variant={focused ? 'Bold' : 'Outline'} size={20} color={focused ? colors.primary : colors.textMuted} />,
      href: '/vendor/customers',
    },
    {
      label: 'More',
      icon: (focused) => <IconsaxMore variant={focused ? 'Bold' : 'Outline'} size={20} color={focused ? colors.primary : colors.textMuted} />,
      href: '/more',
      isMore: true,
    },
  ];

  if (!isAuthenticated || !user) {
    return <Redirect href="/home" />;
  }
  if (user.account_type !== 'vendor') {
    return <Redirect href={user.account_type === 'staff' ? '/staff' : user.account_type === 'admin' ? '/admin' : '/home'} />;
  }

  const handleLogout = async () => {
    setLogoutOpen(false);
    try {
      await logout().unwrap();
    } catch {
      // local cleanup always happens
    }
    dispatch(clearCredentials());
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

  const drawerRows: MoreDrawerRow[] = VENDOR_MENU.map((item) => ({
    label: item.label,
    icon: <item.icon size={20} color={colors.primary} strokeWidth={2} />,
    href: item.href,
    permission: item.permission,
  }));

  const statusColor = (status: string): string => {
    if (status === 'active') return colors.success;
    if (status === 'pending') return colors.warning;
    return colors.danger;
  };

  return (
    <>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: true,
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text, fontFamily: 'Outfit_700Bold' },
            headerStyle: { backgroundColor: colors.surface },
            contentStyle: { paddingBottom: NAV_HEIGHT + insets.bottom },
            headerRight: () => (
              <Row style={{ gap: spacing.md }}>
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
          <Stack.Screen name="pos" options={{ title: 'Sales Terminal', headerShown: false, contentStyle: { paddingBottom: 0 } }} />
          <Stack.Screen name="sales-history" options={{ title: 'Sales History' }} />
          <Stack.Screen name="payouts" options={{ title: 'Payouts' }} />
          <Stack.Screen name="school-zones" options={{ title: 'School Zones' }} />
          <Stack.Screen name="templates" options={{ title: 'Templates' }} />
          <Stack.Screen name="analytics" options={{ title: 'Analytics' }} />
          <Stack.Screen name="settings" options={{ title: 'Store Settings' }} />
          <Stack.Screen name="help" options={{ title: 'Help' }} />
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
        title="Menu"
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
                backgroundColor: 'rgba(244,63,94,0.1)',
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  backgroundColor: 'rgba(244,63,94,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LogOut size={18} color="#e11d48" />
              </View>
              <AppText variant="label" weight="bold" color="#e11d48">
                Logout
              </AppText>
            </Pressable>
          }
        >
          <View style={{ padding: spacing.lg, gap: spacing.xs }}>
            <AppText variant="small" weight="bold" color={colors.textSubtle} style={{ textTransform: 'uppercase' }}>
              Switch Store
            </AppText>
            {myStores && myStores.length > 0 ? (
              myStores.map((storeItem) => {
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
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.md,
                      borderRadius: 4,
                      backgroundColor: isActive ? colors.primaryMuted : colors.surfaceAlt,
                    }}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 4,
                        backgroundColor: isActive ? colors.primaryMuted : colors.surfaceAlt,
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {storeItem.logo ? (
                        <AppImage uri={storeItem.logo} style={{ width: '100%', height: '100%' }} />
                      ) : (
                        <Store size={14} color={colors.primary} />
                      )}
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <AppText variant="label" weight={isActive ? 'bold' : 'medium'} numberOfLines={1}>
                        {storeItem.store_name}
                      </AppText>
                      <AppText variant="small" color={statusColor(storeItem.status)}>
                        {storeItem.status.charAt(0).toUpperCase() + storeItem.status.slice(1)}
                      </AppText>
                    </View>
                    {isActive ? (
                      <CheckCircle2 size={16} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })
            ) : null}
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                setCreateOpen(true);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                borderRadius: 4,
              }}
            >
              <PlusCircle size={18} color={colors.primary} />
              <AppText variant="label" weight="bold" color={colors.primary}>
                Add Another Store
              </AppText>
            </Pressable>
          </View>
        </MoreDrawerContent>
      </Drawer>

      <CreateStoreModal visible={createOpen} onClose={() => setCreateOpen(false)} />

      <ConfirmDialog
        visible={logoutOpen}
        title="Log out of eazystore?"
        message="You will need to sign in again to continue."
        confirmText="Log Out"
        destructive
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </>
  );
}

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
import { useGetStaffPermissionsQuery } from '@/api/staffApi';

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
  permission?: string;
}

export default function StaffLayout() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logout] = useLogoutMutation();

  const { data: permissions } = useGetStaffPermissionsQuery(undefined, {
    skip: !isAuthenticated || user?.account_type !== 'staff',
  });

  if (!isAuthenticated || !user) {
    return <Redirect href="/login" />;
  }
  if (user.account_type !== 'staff') {
    return <Redirect href={user.account_type === 'vendor' ? '/vendor' : user.account_type === 'admin' ? '/admin' : '/home'} />;
  }

  const has = (permission?: string): boolean => {
    if (!permission) {
      return true;
    }
    return permissions?.includes(permission as never) ?? false;
  };

  const menu: MenuItem[] = [
    { label: 'Sales Terminal', icon: 'cart-outline', href: '/staff', permission: 'order:manage' },
    { label: 'Sales History', icon: 'time-outline', href: '/staff/sales-history', permission: 'order:view' },
    { label: 'Settings', icon: 'settings-outline', href: '/staff/settings' },
  ].filter((item) => has(item.permission)) as MenuItem[];

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
        <Stack.Screen name="index" options={{ title: 'Sales Terminal', headerShown: false }} />
        <Stack.Screen name="sales-history" options={{ title: 'Sales History' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>

      <AppModal
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={`EasyStore · ${user.first_name}`}
        scrollable
      >
        <View style={{ gap: spacing.xs }}>
          {menu.map((item) => (
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

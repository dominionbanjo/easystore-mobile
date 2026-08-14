import { View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import {
  CalendarDays,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquare,
  Receipt,
  Settings,
  User,
} from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { AppImage } from '@/components/shared/AppImage';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/theme';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { useLogoutMutation } from '@/api/authApi';
import { clearCredentials } from '@/features/authSlice';
import { useToast } from '@/hooks/useToast';
import { useGetMeQuery } from '@/api/userApi';

export default function AccountScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const [logout] = useLogoutMutation();
  const { data: profile } = useGetMeQuery(undefined, { skip: !isAuthenticated });

  const displayUser = profile?.user ?? user;

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // always clear local session
    }
    dispatch(clearCredentials());
    toast.showSuccess('Signed out');
    router.replace('/home');
  };

  const menuItems: { label: string; icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>; href: string }[] = [
    { label: 'My Orders', icon: Receipt, href: '/orders' },
    { label: 'Wishlist', icon: Heart, href: '/wishlist' },
    { label: 'My Installments', icon: CalendarDays, href: '/installments' },
    { label: 'Messages', icon: MessageSquare, href: '/messages' },
    { label: 'Profile', icon: User, href: '/profile' },
    { label: 'Addresses', icon: MapPin, href: '/addresses' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <Screen>
      <Spacer height={8} />
      <AppText variant="subtitle" weight="bold">
        Account
      </AppText>
      <Spacer height={16} />
      {isAuthenticated && displayUser ? (
        <Card onPress={() => router.push('/profile')} style={{ gap: spacing.md }}>
          <Row style={{ gap: spacing.md }}>
            <AppImage
              uri={displayUser.avatar}
              style={{ width: 56, height: 56, borderRadius: 28 }}
              fallbackText={`${displayUser.first_name[0]}${displayUser.last_name[0]}`}
            />
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle" weight="bold">
                {displayUser.first_name} {displayUser.last_name}
              </AppText>
              <AppText variant="caption" color={colors.textMuted}>
                {displayUser.email}
              </AppText>
            </View>
            <ChevronRight size={20} color={colors.textSubtle} />
          </Row>
        </Card>
      ) : (
        <Card style={{ gap: spacing.md, alignItems: 'center' }}>
          <AppText variant="subtitle" weight="semibold">
            Sign in to manage your account
          </AppText>
          <AppText variant="caption" color={colors.textMuted} center>
            Track orders, save wishlists, chat with sellers and more.
          </AppText>
          <Button
            title="Sign In"
            onPress={() => router.push('/login')}
            size="sm"
            fullWidth={false}
          />
          <Link href="/signup" replace>
            <AppText variant="label" weight="semibold" color={colors.primary}>
              Create an account
            </AppText>
          </Link>
        </Card>
      )}
      <Spacer height={16} />
      <View style={{ gap: spacing.sm }}>
        {menuItems.map((item) => (
          <Card
            key={item.label}
            onPress={() => router.push(item.href as never)}
            padded={false}
            style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}
          >
            <Row style={{ gap: spacing.md }}>
              <item.icon size={20} color={colors.primary} strokeWidth={2} />
              <AppText variant="label" weight="medium" style={{ flex: 1 }}>
                {item.label}
              </AppText>
              <ChevronRight size={18} color={colors.textSubtle} />
            </Row>
          </Card>
        ))}
      </View>
      {isAuthenticated ? (
        <>
          <Spacer height={24} />
          <Button title="Sign Out" variant="danger" onPress={handleLogout} />
        </>
      ) : null}
    </Screen>
  );
}

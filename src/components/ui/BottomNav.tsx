import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme';
import { AppText } from './Text';

export interface BottomNavItem {
  label: string;
  icon: (focused: boolean) => ReactNode;
  href: string;
  exact?: boolean;
  /** Marks the More button — renders without its own route; press goes to `onMorePress`. */
  isMore?: boolean;
}

interface BottomNavProps {
  items: BottomNavItem[];
  onMorePress: () => void;
  moreActive?: boolean;
}

export const NAV_HEIGHT = 64;

function isItemActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Fixed bottom tab bar — mirrors web `DashboardBottomNav` / `StaffBottomNav` (Home·Products·Orders·Customers·More). */
export function BottomNav({ items, onMorePress, moreActive = false }: BottomNavProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View
      style={{
        flexDirection: 'row',
        height: NAV_HEIGHT + insets.bottom,
        paddingBottom: insets.bottom,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      {items.map((item) => {
        const focused = item.isMore ? moreActive : isItemActive(pathname, item.href, item.exact);

        const onPress = () => {
          if (item.isMore) {
            onMorePress();
            return;
          }
          if (!isItemActive(pathname, item.href, item.exact)) {
            router.push(item.href as never);
          }
        };

        return (
          <Pressable
            key={item.href}
            onPress={onPress}
            style={({ pressed }) => [
              {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View
                style={{
                  padding: 6,
                  borderRadius: 5,
                  backgroundColor: focused ? colors.primaryMuted : 'transparent',
                }}
              >
                {item.icon(focused)}
              </View>
              <AppText
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginTop: 2,
                }}
                color={focused ? colors.primary : colors.textMuted}
              >
                {item.label}
              </AppText>
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                marginLeft: -12,
                width: 24,
                height: 4,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                backgroundColor: focused ? colors.primary : 'transparent',
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

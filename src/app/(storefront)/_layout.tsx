import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText } from '@/components/ui/Text';
import { useAppSelector } from '@/hooks';
import { useGetCartQuery } from '@/api/cartApi';
import { selectGuestCart } from '@/features/cartSlice';

function TabIcon({
  icon,
  focused,
  badge,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  badge?: number;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
          backgroundColor: focused ? 'rgba(23,192,110,0.1)' : 'transparent',
        }}
      >
        <Ionicons
          name={focused ? (icon.replace('-outline', '') as never) : icon}
          size={20}
          color={focused ? '#17c06e' : colors.textMuted}
        />
      </View>
      {badge && badge > 0 ? (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -8,
            minWidth: 16,
            height: 16,
            borderRadius: 4,
            backgroundColor: '#17c06e',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 3,
          }}
        >
          <AppText style={{ fontSize: 9, fontWeight: '900' }} color="#ffffff">
            {badge > 9 ? '9+' : badge}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

function CartTabIcon({ focused }: { focused: boolean }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const guestCart = useAppSelector(selectGuestCart);
  const { data: serverCart } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const count = isAuthenticated ? (serverCart?.items.length ?? 0) : guestCart.items.length;
  return <TabIcon icon="bag-handle-outline" focused={focused} badge={count} />;
}

export default function StorefrontLayout() {
  const { colors } = useAppTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#17c06e',
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
        tabBarIconStyle: { marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon icon="home-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Discover',
          tabBarIcon: ({ focused }) => <TabIcon icon="compass-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'More',
          tabBarIcon: ({ focused }) => <TabIcon icon="ellipsis-horizontal" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

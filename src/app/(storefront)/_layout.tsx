import { Tabs } from 'expo-router';
import { Pressable, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Discover, ShoppingBag, User, Briefcase } from 'iconsax-react-native';

import { useAppTheme } from '@/theme';
import { AppText } from '@/components/ui/Text';
import { useAppSelector } from '@/hooks';
import { useGetCartQuery } from '@/api/cartApi';
import { selectGuestCart } from '@/features/cartSlice';

const ACTIVE_COLOR = '#17c06e';
const INACTIVE_COLOR = '#71717a';

function TabItem({
  focused,
  label,
  icon,
  badge,
  onPress,
}: {
  focused: boolean;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
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
            backgroundColor: focused ? 'rgba(23,192,110,0.1)' : 'transparent',
          }}
        >
          {icon}
          {badge && badge > 0 ? (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 16,
                height: 16,
                borderRadius: 5,
                backgroundColor: ACTIVE_COLOR,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 3,
                borderWidth: 2,
                borderColor: colors.surface,
              }}
            >
              <AppText style={{ fontSize: 9, fontWeight: '900' }} color="#ffffff">
                {badge > 9 ? '9+' : badge}
              </AppText>
            </View>
          ) : null}
        </View>
        <AppText
          style={{
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginTop: 2,
          }}
          color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
        >
          {label}
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
          backgroundColor: focused ? ACTIVE_COLOR : 'transparent',
        }}
      />
    </Pressable>
  );
}

function StorefrontTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const guestCart = useAppSelector(selectGuestCart);
  const { data: serverCart } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const cartCount = isAuthenticated ? (serverCart?.cart.items.length ?? 0) : guestCart.items.length;

  const renderIcon = (routeName: string, focused: boolean): React.ReactNode => {
    const variant = focused ? ('Bold' as const) : ('Outline' as const);
    const color = focused ? ACTIVE_COLOR : INACTIVE_COLOR;
    switch (routeName) {
      case 'home':
        return <Home variant={variant} size={20} color={color} />;
      case 'search':
        return <Discover variant={variant} size={20} color={color} />;
      case 'cart':
        return <ShoppingBag variant={variant} size={20} color={color} />;
      case 'account': {
        if (user?.avatar) {
          return (
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 5,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%' }} />
            </View>
          );
        }
        if (isAuthenticated && (user?.account_type === 'vendor' || user?.account_type === 'admin')) {
          return <Briefcase variant={variant} size={20} color={color} />;
        }
        return <User variant={variant} size={20} color={color} />;
      }
      default:
        return <User variant={variant} size={20} color={color} />;
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        height: 64 + insets.bottom,
        paddingBottom: insets.bottom,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      {state.routes.map((route, index) => {
        const focused = index === state.index;
        const options = descriptors[route.key].options;
        const label = options.title ?? route.name;
        const badge = route.name === 'cart' ? cartCount : undefined;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TabItem
            key={route.key}
            focused={focused}
            label={label}
            badge={badge}
            icon={renderIcon(route.name, focused)}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}

export default function StorefrontLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <StorefrontTabBar {...props} />}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="search" options={{ title: 'Discover' }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart' }} />
      <Tabs.Screen name="account" options={{ title: 'More' }} />
    </Tabs>
  );
}

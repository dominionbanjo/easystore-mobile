import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, SplashScreen } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'expo-status-bar';
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
  useFonts,
} from '@expo-google-fonts/outfit';

import { store, persistor } from '@/store';
import { setStoreRef } from '@/api/client';
import { setCredentials, clearCredentials, setAccessToken } from '@/features/authSlice';
import { getToken } from '@/utils/tokenStorage';
import { useAppTheme, ThemeProvider, useThemeMode } from '@/theme';
import { ToastHost } from '@/components/ui/Toast';
import { userApi } from '@/api/userApi';
import { useAppDispatch } from '@/hooks';

SplashScreen.preventAutoHideAsync();

setStoreRef(store);

function RootNavigator() {
  const dispatch = useAppDispatch();
  const [booting, setBooting] = useState(true);
  const mode = useThemeMode();
  const theme = useAppTheme();

  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
  });

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const persistedUser = store.getState().auth.user;
          if (persistedUser) {
            dispatch(setCredentials({ user: persistedUser, access: token }));
          } else {
            dispatch(setAccessToken(token));
          }
          // Revalidate the session in the background — getMe dispatches
          // `setUser` on success so the persisted profile stays fresh.
          store.dispatch(userApi.endpoints.getMe.initiate(undefined));
        } else {
          dispatch(clearCredentials());
        }
      } finally {
        setBooting(false);
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    if (!booting && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [booting, fontsLoaded]);

  if (booting || !fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }} />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.primary,
            headerTitleStyle: { color: theme.colors.text, fontFamily: 'Outfit_700Bold' },
            headerStyle: { backgroundColor: theme.colors.background },
            headerShadowVisible: false,
            headerBackTitle: 'Back',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(storefront)" />
          <Stack.Screen name="(vendor)" />
          <Stack.Screen name="(staff)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="product/[slug]" options={{ headerShown: true, title: 'Product' }} />
          <Stack.Screen name="store/[slug]" options={{ headerShown: true, title: 'Store' }} />
          <Stack.Screen name="zone/[identifier]" options={{ headerShown: true, title: 'Zone' }} />
          <Stack.Screen name="category/[slug]" options={{ headerShown: true, title: 'Category' }} />
          <Stack.Screen name="products" options={{ headerShown: true, title: 'Products' }} />
          <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Checkout' }} />
          <Stack.Screen name="verify-payment" options={{ headerShown: true, title: 'Payment', headerBackVisible: false }} />
          <Stack.Screen name="orders" options={{ headerShown: true, title: 'My Orders' }} />
          <Stack.Screen name="order/[id]" options={{ headerShown: true, title: 'Order' }} />
          <Stack.Screen name="wishlist" options={{ headerShown: true, title: 'My Wishlist' }} />
          <Stack.Screen name="profile" options={{ headerShown: true, title: 'Profile' }} />
          <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
          <Stack.Screen name="addresses" options={{ headerShown: true, title: 'Addresses' }} />
          <Stack.Screen name="installments" options={{ headerShown: true, title: 'My Installments' }} />
          <Stack.Screen name="installment/[id]" options={{ headerShown: true, title: 'Installment Plan' }} />
          <Stack.Screen name="messages" options={{ headerShown: true, title: 'Messages' }} />
          <Stack.Screen name="conversation/[id]" options={{ headerShown: true, title: 'Chat' }} />
        </Stack>
        <ToastHost />
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      </View>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<BootSplash />} persistor={persistor}>
        <ThemeProvider>
          <SafeAreaProvider>
            <RootNavigator />
          </SafeAreaProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

function BootSplash() {
  const { colors } = useAppTheme();
  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}

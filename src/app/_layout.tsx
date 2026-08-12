import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack, SplashScreen } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';

import { store, persistor } from '@/store';
import { setStoreRef } from '@/api/client';
import { setCredentials, clearCredentials, setAccessToken } from '@/features/authSlice';
import { TOKEN_STORAGE_KEY } from '@/constants/api';
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

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
        if (token) {
          const persistedUser = store.getState().auth.user;
          if (persistedUser) {
            dispatch(setCredentials({ user: persistedUser, access: token }));
          } else {
            dispatch(setAccessToken(token));
          }
          store.dispatch(userApi.endpoints.getMe.initiate(undefined));
        } else {
          dispatch(clearCredentials());
        }
      } finally {
        setBooting(false);
        SplashScreen.hideAsync();
      }
    })();
  }, [dispatch]);

  if (booting) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }} />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(storefront)" />
        <Stack.Screen name="(vendor)" />
        <Stack.Screen name="(staff)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="product/[slug]" />
        <Stack.Screen name="store/[slug]" />
        <Stack.Screen name="zone/[identifier]" />
        <Stack.Screen name="category/[slug]" />
        <Stack.Screen name="products" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="verify-payment" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="wishlist" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="addresses" />
        <Stack.Screen name="installments" />
        <Stack.Screen name="installment/[id]" />
        <Stack.Screen name="messages" />
        <Stack.Screen name="conversation/[id]" />
      </Stack>
      <ToastHost />
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

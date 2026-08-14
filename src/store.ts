import { configureStore } from '@reduxjs/toolkit';
import {
  persistReducer,
  persistStore,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import type { PersistConfig } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { combineReducers } from 'redux';

import { apiManager } from './api/client';
import authReducer, { type AuthState } from './features/authSlice';
import uiReducer from './features/uiSlice';
import cartReducer from './features/cartSlice';
import saleCartReducer from './features/saleCartSlice';
import type { IUser } from './types/auth';

const webStorage = {
  getItem: async (key: string): Promise<string | null> =>
    typeof window !== 'undefined' ? window.localStorage.getItem(key) : null,
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  },
};

/**
 * Standard mobile session strategy:
 * - The access token is the ONLY secret — stored exclusively in SecureStore
 *   (Keychain/Keystore) via `tokenStorage.ts`, never in AsyncStorage.
 * - The user profile is persisted here (AsyncStorage) so the session can be
 *   restored instantly on launch (offline-first) and revalidated in the
 *   background via `GET /users/me`.
 */
const authTransform = createTransform<AuthState, { user: IUser | null }, RootReducerState>(
  (inbound) => ({ user: inbound.user }),
  (outbound) => ({
    user: outbound.user,
    accessToken: null,
    isAuthenticated: Boolean(outbound.user),
    isHydrated: true,
    initialRouteSet: false,
  }),
  { whitelist: ['auth'] },
);

const persistConfig: PersistConfig<RootReducerState> = {
  key: 'root',
  storage: Platform.OS === 'web' ? webStorage : AsyncStorage,
  whitelist: ['auth', 'cart', 'saleCart'],
  transforms: [authTransform],
};

const rootReducer = combineReducers({
  [apiManager.reducerPath]: apiManager.reducer,
  auth: authReducer,
  ui: uiReducer,
  cart: cartReducer,
  saleCart: saleCartReducer,
});

type RootReducerState = ReturnType<typeof rootReducer>;

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiManager.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

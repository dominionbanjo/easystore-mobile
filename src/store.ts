import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

import { apiManager } from './api/client';
import authReducer from './features/authSlice';
import uiReducer from './features/uiSlice';
import cartReducer from './features/cartSlice';
import saleCartReducer from './features/saleCartSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['cart', 'saleCart'],
};

const rootReducer = combineReducers({
  [apiManager.reducerPath]: apiManager.reducer,
  auth: authReducer,
  ui: uiReducer,
  cart: cartReducer,
  saleCart: saleCartReducer,
});

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

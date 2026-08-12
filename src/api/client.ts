import {
  createApi,
  fetchBaseQuery,
  retry,
} from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, TOKEN_STORAGE_KEY } from '@/constants/api';
import { getErrorMessage, isUnauthorizedError } from '@/utils/error';
import type { RootState } from '@/store';

type AppStore = {
  getState: () => RootState;
  dispatch: (action: { type: string }) => void;
};

let storeRef: AppStore | null = null;

export function setStoreRef(store: AppStore): void {
  storeRef = store;
}

export function getStoreRef(): AppStore | null {
  return storeRef;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers) => {
    const token = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Accept', 'application/json');
    return headers;
  },
});

export interface ApiEnvelope<T> {
  status: string;
  message: string;
  data: T;
}

async function handleUnauthorized(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
  if (storeRef) {
    storeRef.dispatch({ type: 'auth/clearCredentials' });
  }
}

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const state = api.getState() as RootState;
  const hadToken = Boolean(state.auth.accessToken);

  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const status = result.error.status;
    if (status === 401 || isUnauthorizedError(result.error)) {
      await handleUnauthorized();
    }
    return result;
  }

  const envelope = result.data as ApiEnvelope<unknown>;
  if (envelope && typeof envelope === 'object' && 'data' in envelope) {
    return { data: envelope.data as never };
  }
  return { data: envelope as never };
};

export const baseQueryWithRetry = retry(baseQueryWithAuth, { maxRetries: 2 });

export const apiManager = createApi({
  reducerPath: 'apiManager',
  baseQuery: baseQueryWithRetry,
  tagTypes: [
    'Auth',
    'User',
    'Cart',
    'Wishlist',
    'Store',
    'Product',
    'Draft',
    'Analytics',
    'Messaging',
    'Notification',
    'Broadcast',
    'Payout',
    'Staff',
    'Order',
    'Installments',
    'SchoolZone',
    'Categories',
    'Colors',
    'Transactions',
    'Sales',
    'Reviews',
  ],
  endpoints: () => ({}),
});

export function mutationErrorMessage(
  error: { data?: unknown } | undefined,
  fallback = 'Request failed. Please try again.',
): string {
  if (!error || typeof error !== 'object' || !('data' in error)) {
    return fallback;
  }
  const data = error.data as { message?: string | string[] };
  if (data && typeof data.message === 'string') {
    return data.message;
  }
  if (data && Array.isArray(data.message) && data.message.length > 0) {
    return data.message[0];
  }
  return getErrorMessage(undefined, fallback);
}

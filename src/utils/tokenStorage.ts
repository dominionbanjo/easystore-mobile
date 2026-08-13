import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { TOKEN_STORAGE_KEY } from '@/constants/api';

const WEB_STORAGE_KEY = 'EazyStore.access_token';

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return window.localStorage.getItem(WEB_STORAGE_KEY);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
}

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      window.localStorage.setItem(WEB_STORAGE_KEY, token);
    } catch {
      // storage unavailable
    }
    return;
  }
  await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
}

export async function deleteToken(): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      window.localStorage.removeItem(WEB_STORAGE_KEY);
    } catch {
      // storage unavailable
    }
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
}

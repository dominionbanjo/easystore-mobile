import Constants from 'expo-constants';

const DEFAULT_URL = 'http://localhost:3000';

function resolveBaseUrl(): string {
  const configured = Constants.expoConfig?.extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL;
  if (configured && configured.length > 0) {
    return configured;
  }
  return DEFAULT_URL;
}

export const API_BASE_URL: string = resolveBaseUrl();

export const SOCKET_URL: string = `${API_BASE_URL}/messaging`;

export const TOKEN_STORAGE_KEY = 'EazyStore.access_token';

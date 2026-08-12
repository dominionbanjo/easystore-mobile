import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

interface ApiErrorPayload {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  errors?: { message?: string; constraints?: Record<string, string> }[];
}

export function getErrorMessage(
  error: FetchBaseQueryError | SerializedError | unknown | undefined,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }
  if ('status' in error && typeof error.status === 'number') {
    const data = (error as { data?: ApiErrorPayload }).data;
    if (data) {
      if (Array.isArray(data.message)) {
        return data.message[0] ?? fallback;
      }
      if (typeof data.message === 'string') {
        return data.message;
      }
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const first = data.errors[0];
        if (first?.message) {
          return first.message;
        }
        if (first?.constraints) {
          const values = Object.values(first.constraints);
          if (values.length > 0) {
            return values[0];
          }
        }
      }
      if (typeof data.error === 'string') {
        return data.error;
      }
    }
    return `Request failed with status ${error.status}`;
  }
  if ('message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
}

export function isUnauthorizedError(error: FetchBaseQueryError | SerializedError | undefined): boolean {
  if (error && 'status' in error && error.status === 401) {
    return true;
  }
  const message = getErrorMessage(error, '');
  const lower = message.toLowerCase();
  return lower.includes('invalid token') || lower.includes('unauthorized');
}

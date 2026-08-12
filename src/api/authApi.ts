import * as SecureStore from 'expo-secure-store';
import { apiManager } from './client';
import { TOKEN_STORAGE_KEY } from '@/constants/api';
import { setCredentials } from '@/features/authSlice';
import type {
  IAuthData,
  ILoginPayload,
  IRegisterPayload,
  ISwitchStorePayload,
  ISwitchStoreResponse,
  IVerifyOtpPayload,
} from '@/types/auth';

export const authApi = apiManager.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<IAuthData, ILoginPayload>({
      query: (body) => ({ url: 'auth/login', method: 'POST', body }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, data.access);
          dispatch(setCredentials(data));
        } catch {
          // handled by caller
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),
    register: build.mutation<IAuthData, IRegisterPayload>({
      query: (body) => ({ url: 'auth/register', method: 'POST', body }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, data.access);
          dispatch(setCredentials(data));
        } catch {
          // handled by caller
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),
    verifyOtp: build.mutation<IAuthData, IVerifyOtpPayload>({
      query: (body) => ({ url: 'auth/verify-otp', method: 'POST', body }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, data.access);
          dispatch(setCredentials(data));
        } catch {
          // handled by caller
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),
    googleLogin: build.mutation<IAuthData, { token: string }>({
      query: (body) => ({ url: 'auth/google', method: 'POST', body }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, data.access);
          dispatch(setCredentials(data));
        } catch {
          // handled by caller
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),
    resendOtp: build.mutation<{ success: boolean }, { email: string }>({
      query: (body) => ({ url: 'auth/resend-otp', method: 'POST', body }),
    }),
    forgotPassword: build.mutation<{ success: boolean }, { email: string }>({
      query: (body) => ({ url: 'auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: build.mutation<
      { success: boolean },
      { token: string; email: string; password: string }
    >({
      query: (body) => ({ url: 'auth/reset-password', method: 'POST', body }),
    }),
    switchStore: build.mutation<ISwitchStoreResponse, ISwitchStorePayload>({
      query: (body) => ({ url: 'auth/switch-store', method: 'POST', body }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.access_token) {
            await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, data.access_token);
            dispatch({ type: 'auth/setAccessToken', payload: data.access_token });
          }
        } catch {
          // handled by caller
        }
      },
      invalidatesTags: ['Auth', 'User', 'Store'],
    }),
    logout: build.mutation<{ success: boolean }, void>({
      query: () => ({ url: 'auth/logout', method: 'POST' }),
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          await queryFulfilled;
        } finally {
          await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useGoogleLoginMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useSwitchStoreMutation,
  useLogoutMutation,
} = authApi;

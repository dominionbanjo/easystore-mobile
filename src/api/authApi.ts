
import { apiManager } from './client';
import { setToken, deleteToken } from '@/utils/tokenStorage';
import { setCredentials } from '@/features/authSlice';
import type { MessageOnlyResponse } from '@/types/api';
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
          await setToken(data.access);
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
          await setToken(data.access);
          dispatch(setCredentials(data));
        } catch {
          // handled by caller
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),
    verifyOtp: build.mutation<MessageOnlyResponse, IVerifyOtpPayload>({
      query: (body) => ({ url: 'auth/verify-otp', method: 'POST', body }),
      invalidatesTags: ['Auth', 'User'],
    }),
    googleLogin: build.mutation<IAuthData, { token: string }>({
      query: (body) => ({ url: 'auth/google', method: 'POST', body }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          await setToken(data.access);
          dispatch(setCredentials(data));
        } catch {
          // handled by caller
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),
    resendOtp: build.mutation<MessageOnlyResponse, { email: string }>({
      query: (body) => ({ url: 'auth/resend-otp', method: 'POST', body }),
    }),
    forgotPassword: build.mutation<MessageOnlyResponse, { email: string }>({
      query: (body) => ({ url: 'auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: build.mutation<
      MessageOnlyResponse,
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
            await setToken(data.access_token);
            dispatch({ type: 'auth/setAccessToken', payload: data.access_token });
          }
        } catch {
          // handled by caller
        }
      },
      invalidatesTags: ['Auth', 'User', 'Store'],
    }),
    logout: build.mutation<MessageOnlyResponse, void>({
      query: () => ({ url: 'auth/logout', method: 'POST' }),
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          await queryFulfilled;
        } finally {
          await deleteToken();
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

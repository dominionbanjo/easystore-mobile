import { apiManager } from './client';
import { setUser } from '@/features/authSlice';
import type { IBank, IBankVerifyResponse, IProfileResponse } from '@/types/auth';
import type { SuccessResponse, MessageOnlyResponse } from '@/types/api';

export interface IAddressPayload {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  is_default?: boolean;
}

export const userApi = apiManager.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<IProfileResponse, void>({
      query: () => 'users/me',
      providesTags: ['User'],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
        } catch {
          // 401 auto-logout is handled by the base query; other failures
          // keep the persisted session intact (offline-first).
        }
      },
    }),
    updateMe: build.mutation<SuccessResponse, FormData>({
      query: (formData) => ({ url: 'users/me', method: 'PATCH', body: formData }),
      invalidatesTags: ['User'],
    }),
    getBanks: build.query<IBank[], void>({
      query: () => 'payments/paystack/banks',
    }),
    registerBank: build.mutation<
      MessageOnlyResponse,
      { bank_code: string; account_number: string; settlement_email?: string }
    >({
      query: (body) => ({ url: 'users/bank/register', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    verifyBankDetails: build.mutation<
      IBankVerifyResponse,
      { bank_code: string; account_number: string }
    >({
      query: (body) => ({ url: 'payments/paystack/bank/verify', method: 'POST', body }),
    }),
    addAddress: build.mutation<SuccessResponse, IAddressPayload>({
      query: (body) => ({ url: 'users/me/addresses', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    updateAddress: build.mutation<SuccessResponse, { id: string; body: Partial<IAddressPayload> }>({
      query: ({ id, body }) => ({ url: `users/me/addresses/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
    deleteAddress: build.mutation<MessageOnlyResponse, string>({
      query: (id) => ({ url: `users/me/addresses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useGetBanksQuery,
  useRegisterBankMutation,
  useVerifyBankDetailsMutation,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = userApi;

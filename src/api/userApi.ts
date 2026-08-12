import { apiManager } from './client';
import type { IBank, IUser, IUserAddress } from '@/types/auth';
import type { SuccessResponse } from '@/types/api';

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
    getMe: build.query<IUser, void>({
      query: () => 'users/me',
      providesTags: ['User'],
    }),
    updateMe: build.mutation<IUser, FormData>({
      query: (formData) => ({ url: 'users/me', method: 'PATCH', body: formData }),
      invalidatesTags: ['User'],
    }),
    getBanks: build.query<IBank[], void>({
      query: () => 'payments/paystack/banks',
    }),
    registerBank: build.mutation<
      SuccessResponse,
      { bank_code: string; account_number: string; settlement_email?: string }
    >({
      query: (body) => ({ url: 'users/bank/register', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    verifyBankDetails: build.mutation<
      { success: boolean; account_name?: string },
      { bank_code: string; account_number: string }
    >({
      query: (body) => ({ url: 'payments/paystack/bank/verify', method: 'POST', body }),
    }),
    addAddress: build.mutation<IUserAddress, IAddressPayload>({
      query: (body) => ({ url: 'users/me/addresses', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    updateAddress: build.mutation<IUserAddress, { id: string; body: Partial<IAddressPayload> }>({
      query: ({ id, body }) => ({ url: `users/me/addresses/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
    deleteAddress: build.mutation<SuccessResponse, string>({
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

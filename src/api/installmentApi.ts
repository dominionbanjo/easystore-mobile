import { apiManager } from './client';
import type { SuccessResponse } from '@/types/api';
import type {
  IInstallmentConfig,
  IInstallmentDetailResponse,
  IInstallmentListData,
  IInstallmentPaymentInitResponse,
  IInstallmentPlan,
  ICreateInstallmentPayload,
  IInstallmentPreset,
  IAdminInstallment,
  IVendorInstallment,
} from '@/types/installment';

export const installmentApi = apiManager.injectEndpoints({
  endpoints: (build) => ({
    getInstallmentConfig: build.query<IInstallmentConfig, void>({
      query: () => 'installments/config',
      providesTags: ['Installments'],
    }),
    getInstallmentPresets: build.query<IInstallmentPreset[], void>({
      query: () => 'installments/config',
      transformResponse: (response: IInstallmentConfig) => response.presets,
      providesTags: ['Installments'],
    }),
    createInstallment: build.mutation<SuccessResponse, ICreateInstallmentPayload>({
      query: (body) => ({ url: 'installments', method: 'POST', body }),
      invalidatesTags: ['Installments', 'Order'],
    }),
    getMyInstallments: build.query<
      IInstallmentListData<IInstallmentPlan>,
      { page?: number; limit?: number; status?: string }
    >({
      query: ({ page = 1, limit = 10, status } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) params.set('status', status);
        return `installments/mine?${params.toString()}`;
      },
      providesTags: ['Installments'],
    }),
    getInstallmentById: build.query<IInstallmentDetailResponse, string>({
      query: (id) => `installments/${id}`,
      providesTags: ['Installments'],
    }),
    payInstallment: build.mutation<IInstallmentPaymentInitResponse, string>({
      query: (id) => ({ url: `installments/${id}/pay`, method: 'POST' }),
      invalidatesTags: ['Installments'],
    }),
    payoffInstallment: build.mutation<IInstallmentPaymentInitResponse, string>({
      query: (id) => ({ url: `installments/${id}/payoff`, method: 'POST' }),
      invalidatesTags: ['Installments'],
    }),
    cancelInstallment: build.mutation<SuccessResponse, string>({
      query: (id) => ({ url: `installments/${id}/cancel`, method: 'POST' }),
      invalidatesTags: ['Installments'],
    }),
    getVendorInstallments: build.query<
      IInstallmentListData<IVendorInstallment>,
      { page?: number; limit?: number; status?: string }
    >({
      query: ({ page = 1, limit = 10, status } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) params.set('status', status);
        return `admin/vendor/installments?${params.toString()}`;
      },
      providesTags: ['Installments'],
    }),
    getAdminInstallments: build.query<
      IInstallmentListData<IAdminInstallment>,
      { page?: number; limit?: number; status?: string }
    >({
      query: ({ page = 1, limit = 10, status } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) params.set('status', status);
        return `admin/installments?${params.toString()}`;
      },
      providesTags: ['Installments'],
    }),
    forceCompleteInstallment: build.mutation<SuccessResponse, string>({
      query: (id) => ({ url: `admin/installments/${id}/force-complete`, method: 'POST' }),
      invalidatesTags: ['Installments'],
    }),
    forceCancelInstallment: build.mutation<SuccessResponse, string>({
      query: (id) => ({ url: `admin/installments/${id}/force-cancel`, method: 'POST' }),
      invalidatesTags: ['Installments'],
    }),
  }),
});

export const {
  useGetInstallmentConfigQuery,
  useGetInstallmentPresetsQuery,
  useCreateInstallmentMutation,
  useGetMyInstallmentsQuery,
  useGetInstallmentByIdQuery,
  usePayInstallmentMutation,
  usePayoffInstallmentMutation,
  useCancelInstallmentMutation,
  useGetVendorInstallmentsQuery,
  useGetAdminInstallmentsQuery,
  useForceCompleteInstallmentMutation,
  useForceCancelInstallmentMutation,
} = installmentApi;

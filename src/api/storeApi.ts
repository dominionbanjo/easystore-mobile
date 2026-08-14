import { apiManager } from './client';
import type { SuccessResponse, MessageOnlyResponse, IPaginatedData } from '@/types/api';
import type {
  ICreateStorePayload,
  IDeliveryRate,
  IDeliveryRatePayload,
  IStore,
  IStoreAnalytics,
  IStoreDetailResponse,
  IStoreOwnerDetails,
  IStoreTemplate,
  IStoreThemeSetting,
  IUpdateStorePayload,
  IVendorCustomer,
  IVendorPayout,
} from '@/types/store';

export const storeApi = apiManager.injectEndpoints({
  endpoints: (build) => ({
    getStoreByIdentifier: build.query<IStoreDetailResponse, string>({
      query: (identifier) => `store/${identifier}`,
      providesTags: ['Store'],
    }),
    getMyStore: build.query<IStoreOwnerDetails, void>({
      query: () => 'store/me',
      providesTags: ['Store'],
    }),
    getMyStores: build.query<IStoreOwnerDetails[], void>({
      query: () => 'store/my-stores',
      providesTags: ['Store'],
    }),
    searchStores: build.query<IPaginatedData<IStore>, { q?: string; page?: number; limit?: number }>(
      {
        query: ({ q, page = 1, limit = 20 }) => {
          const params = new URLSearchParams({ page: String(page), limit: String(limit) });
          if (q) params.set('q', q);
          return `store/search?${params.toString()}`;
        },
        providesTags: ['Store'],
      },
    ),
    getTrendingStores: build.query<IPaginatedData<IStore>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 } = {}) => `store?sort=trending&page=${page}&limit=${limit}`,
      providesTags: ['Store'],
    }),
    createStore: build.mutation<SuccessResponse & { id?: string }, ICreateStorePayload>({
      query: (body) => ({ url: 'store', method: 'POST', body }),
      invalidatesTags: ['Store', 'User'],
    }),
    updateStore: build.mutation<SuccessResponse, { id: string; body: IUpdateStorePayload }>({
      query: ({ id, body }) => ({ url: `store/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Store', 'User'],
    }),
    updateStoreTheme: build.mutation<
      IStoreThemeSetting,
      { id: string; body: { template_id?: string; custom_config?: Record<string, string> } }
    >({
      query: ({ id, body }) => ({ url: `store/${id}/theme`, method: 'PATCH', body }),
      invalidatesTags: ['Store'],
    }),
    getStoreTemplates: build.query<IStoreTemplate[], void>({
      query: () => 'store/templates',
    }),
    getDeliveryRates: build.query<IDeliveryRate[], string>({
      query: (storeId) => `store-delivery-rates/store/${storeId}`,
      providesTags: ['Store'],
    }),
    createDeliveryRate: build.mutation<SuccessResponse, { storeId: string; body: IDeliveryRatePayload }>({
      query: ({ storeId, body }) => ({
        url: `store-delivery-rates/store/${storeId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Store'],
    }),
    updateDeliveryRate: build.mutation<MessageOnlyResponse, { rateId: string; body: Partial<IDeliveryRatePayload> }>({
      query: ({ rateId, body }) => ({
        url: `store-delivery-rates/${rateId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Store'],
    }),
    deleteDeliveryRate: build.mutation<MessageOnlyResponse, string>({
      query: (rateId) => ({ url: `store-delivery-rates/${rateId}`, method: 'DELETE' }),
      invalidatesTags: ['Store'],
    }),
    registerStoreBank: build.mutation<
      SuccessResponse,
      { storeId: string; body: { bank_code: string; account_number: string } }
    >({
      query: ({ storeId, body }) => ({ url: `store/${storeId}/bank`, method: 'POST', body }),
      invalidatesTags: ['Store'],
    }),
    checkStoreName: build.query<MessageOnlyResponse, string>({
      query: (name) => `store/lookup/check-name?name=${encodeURIComponent(name)}`,
    }),
    checkSubdomain: build.query<{ available: boolean }, { subdomain: string; storeId?: string }>({
      query: ({ subdomain, storeId }) => {
        const params = new URLSearchParams({ subdomain });
        if (storeId) params.set('storeId', storeId);
        return `store/lookup/check-subdomain?${params.toString()}`;
      },
    }),
    getStoreCustomers: build.query<
      IPaginatedData<IVendorCustomer>,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.set('search', search);
        return `store-customers?${params.toString()}`;
      },
    }),
    getStoreAnalytics: build.query<IStoreAnalytics, void>({
      query: () => 'store-analytics/me',
      providesTags: ['Analytics'],
    }),
    getVendorPayouts: build.query<IPaginatedData<IVendorPayout>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => `payouts/vendor/me?page=${page}&limit=${limit}`,
      providesTags: ['Payout'],
    }),
  }),
});

export const {
  useGetStoreByIdentifierQuery,
  useGetMyStoreQuery,
  useGetMyStoresQuery,
  useSearchStoresQuery,
  useGetTrendingStoresQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useUpdateStoreThemeMutation,
  useGetStoreTemplatesQuery,
  useGetDeliveryRatesQuery,
  useCreateDeliveryRateMutation,
  useUpdateDeliveryRateMutation,
  useDeleteDeliveryRateMutation,
  useRegisterStoreBankMutation,
  useCheckStoreNameQuery,
  useCheckSubdomainQuery,
  useGetStoreCustomersQuery,
  useGetStoreAnalyticsQuery,
  useGetVendorPayoutsQuery,
} = storeApi;

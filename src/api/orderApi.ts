import { apiManager } from './client';
import type { SuccessResponse, IPaginatedData } from '@/types/api';
import type {
  ICheckoutSummaryResponse,
  ICreateOnlineOrderPayload,
  ICreateOfflineOrderPayload,
  IOnlineOrderResponse,
  IOrder,
  IOrderQueryParams,
  IRecordVendorOfflineSalePayload,
  IReceiptData,
  ISalesRecord,
  IVendorOrderQueryParams,
} from '@/types/order';

export const orderApi = apiManager.injectEndpoints({
  endpoints: (build) => ({
    getOrderSummary: build.mutation<
      ICheckoutSummaryResponse,
      { order_items: { product_id: string; variant_id?: string; quantity: number }[] }
    >({
      query: (body) => ({ url: 'orders/summary', method: 'POST', body }),
    }),
    createOnlineOrder: build.mutation<IOnlineOrderResponse, ICreateOnlineOrderPayload>({
      query: (body) => ({ url: 'orders/online', method: 'POST', body }),
      invalidatesTags: ['Order', 'Cart', 'Product'],
    }),
    createOfflineOrder: build.mutation<
      SuccessResponse & { order_id?: string },
      ICreateOfflineOrderPayload
    >({
      query: (body) => ({ url: 'orders/offline', method: 'POST', body }),
      invalidatesTags: ['Order', 'Product'],
    }),
    recordVendorOfflineSale: build.mutation<
      SuccessResponse & { order_id?: string },
      IRecordVendorOfflineSalePayload
    >({
      query: (body) => ({ url: 'orders/vendor/offline-sale', method: 'POST', body }),
      invalidatesTags: ['Order', 'Product', 'Sales', 'Analytics'],
    }),
    verifyOrderPayment: build.mutation<SuccessResponse, string>({
      query: (reference) => ({ url: `orders/verify/${reference}`, method: 'POST' }),
      invalidatesTags: ['Order'],
    }),
    getMyOrders: build.query<IPaginatedData<IOrder>, IOrderQueryParams>({
      query: (params = {}) => {
        const query = new URLSearchParams();
        query.set('page', String(params.page ?? 1));
        query.set('limit', String(params.limit ?? 10));
        if (params.status) query.set('status', params.status);
        if (params.search) query.set('search', params.search);
        return `orders?${query.toString()}`;
      },
      providesTags: ['Order'],
    }),
    getOrderById: build.query<IOrder, string>({
      query: (id) => `orders/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Order', id }],
    }),
    getVendorOrders: build.query<IPaginatedData<IOrder>, IOrderQueryParams>({
      query: (params = {}) => {
        const query = new URLSearchParams();
        query.set('page', String(params.page ?? 1));
        query.set('limit', String(params.limit ?? 10));
        if (params.status) query.set('status', params.status);
        if (params.search) query.set('search', params.search);
        return `orders/vendor/me?${query.toString()}`;
      },
      providesTags: ['Order'],
    }),
    getSalesHistory: build.query<IPaginatedData<ISalesRecord>, IVendorOrderQueryParams>({
      query: (params = {}) => {
        const query = new URLSearchParams();
        query.set('page', String(params.page ?? 1));
        query.set('limit', String(params.limit ?? 20));
        if (params.staffId) query.set('staffId', params.staffId);
        if (params.dateFrom) query.set('dateFrom', params.dateFrom);
        if (params.dateTo) query.set('dateTo', params.dateTo);
        if (params.search) query.set('search', params.search);
        if (params.status) query.set('status', params.status);
        return `orders/vendor/sales-history?${query.toString()}`;
      },
      providesTags: ['Sales'],
    }),
    updateOrderStatus: build.mutation<SuccessResponse, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Order', 'Sales'],
    }),
    cancelOrder: build.mutation<SuccessResponse, string>({
      query: (id) => ({ url: `orders/${id}/cancel`, method: 'PATCH' }),
      invalidatesTags: ['Order', 'Sales'],
    }),
    fulfillOfflineOrder: build.mutation<SuccessResponse, string>({
      query: (id) => ({ url: `orders/offline/${id}/fulfill`, method: 'PATCH' }),
      invalidatesTags: ['Order', 'Sales'],
    }),
    getReceiptData: build.query<IReceiptData, string>({
      query: (id) => `orders/${id}/receipt-data`,
      providesTags: (_result, _err, id) => [{ type: 'Order', id }],
    }),
    getReceiptPdf: build.query<{ pdf: string; filename: string }, string>({
      query: (id) => `orders/${id}/receipt`,
      keepUnusedDataFor: 60,
    }),
  }),
});

export const {
  useGetOrderSummaryMutation,
  useCreateOnlineOrderMutation,
  useCreateOfflineOrderMutation,
  useRecordVendorOfflineSaleMutation,
  useVerifyOrderPaymentMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useGetVendorOrdersQuery,
  useGetSalesHistoryQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useFulfillOfflineOrderMutation,
  useGetReceiptDataQuery,
  useGetReceiptPdfQuery,
} = orderApi;

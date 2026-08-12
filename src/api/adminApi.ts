import { apiManager } from './client';
import type { SuccessResponse, IPaginatedData } from '@/types/api';
import type {
  IAdminEscrow,
  IAdminPayout,
  IAdminTransaction,
  IAdminUser,
  IAdminVendor,
  IAutomatedNotification,
  IBroadcast,
  IGrowthDataPoint,
  IOrderBreakdown,
  IOverviewStats,
  IRecentSignup,
  ISignupMethod,
  ISystemLog,
  ITopStore,
  ITransactionBreakdown,
  IUserDistribution,
} from '@/types/admin';
import type { IOrder } from '@/types/order';
import type { ISchoolZone, SchoolZoneStatus } from '@/types/zone';

export const adminApi = apiManager.injectEndpoints({
  endpoints: (build) => ({
    getAdminUsers: build.query<
      IPaginatedData<IAdminUser>,
      { page?: number; limit?: number; search?: string; account_type?: string }
    >({
      query: ({ page = 1, limit = 25, search, account_type } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.set('search', search);
        if (account_type) params.set('account_type', account_type);
        return `admin/users?${params.toString()}`;
      },
    }),
    updateUserStatus: build.mutation<SuccessResponse, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `admin/users/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
    }),
    getAdminVendors: build.query<
      IPaginatedData<IAdminVendor>,
      { page?: number; limit?: number; search?: string; status?: string }
    >({
      query: ({ page = 1, limit = 25, search, status } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        return `admin/users/vendors?${params.toString()}`;
      },
    }),
    updateVendorStatus: build.mutation<SuccessResponse, { storeId: string; status: string }>({
      query: ({ storeId, status }) => ({
        url: `admin/users/vendor/${storeId}/status`,
        method: 'PATCH',
        body: { status },
      }),
    }),
    getAdminOrders: build.query<
      IPaginatedData<IOrder>,
      { page?: number; limit?: number; status?: string; search?: string }
    >({
      query: ({ page = 1, limit = 20, status, search } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) params.set('status', status);
        if (search) params.set('search', search);
        return `admin/orders?${params.toString()}`;
      },
    }),
    updateAdminOrderStatus: build.mutation<SuccessResponse, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `admin/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
    }),
    getAdminTransactions: build.query<
      IPaginatedData<IAdminTransaction>,
      { page?: number; limit?: number; type?: string; status?: string }
    >({
      query: ({ page = 1, limit = 20, type, status } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (type) params.set('type', type);
        if (status) params.set('status', status);
        return `admin/transactions?${params.toString()}`;
      },
      providesTags: ['Transactions'],
    }),
    flagTransaction: build.mutation<SuccessResponse, { id: string; is_flagged: boolean }>({
      query: ({ id, is_flagged }) => ({
        url: `admin/transactions/${id}/flag`,
        method: 'PATCH',
        body: { is_flagged },
      }),
      invalidatesTags: ['Transactions'],
    }),
    getAdminPayouts: build.query<IPaginatedData<IAdminPayout>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => `admin/payouts?page=${page}&limit=${limit}`,
      providesTags: ['Payout'],
    }),
    getAdminEscrows: build.query<IPaginatedData<IAdminEscrow>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => `admin/payouts/escrow?page=${page}&limit=${limit}`,
      providesTags: ['Payout'],
    }),
    markEscrowTransferred: build.mutation<SuccessResponse, string>({
      query: (id) => ({
        url: `admin/payouts/escrow/${id}/mark-transferred`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Payout'],
    }),
    getAdminInstallments: build.query<IPaginatedData<unknown>, { page?: number }>({
      query: ({ page = 1 } = {}) => `admin/installments?page=${page}&limit=20`,
      providesTags: ['Installments'],
    }),
    getAdminSchoolZones: build.query<IPaginatedData<ISchoolZone>, { page?: number }>({
      query: ({ page = 1 } = {}) => `school-zones/admin/all?page=${page}&limit=20`,
      providesTags: ['SchoolZone'],
    }),
    getAdminZoneStats: build.query<Record<string, number>, void>({
      query: () => 'school-zones/admin/stats',
      providesTags: ['SchoolZone'],
    }),
    approveSchoolZone: build.mutation<SuccessResponse, { zoneId: string; decision: SchoolZoneStatus }>({
      query: ({ zoneId, decision }) => ({
        url: `school-zones/admin/${zoneId}/approval`,
        method: 'POST',
        body: { decision },
      }),
      invalidatesTags: ['SchoolZone'],
    }),
    getBroadcasts: build.query<IPaginatedData<IBroadcast>, { page?: number }>({
      query: ({ page = 1 } = {}) => `admin/broadcasts?page=${page}&limit=20`,
      providesTags: ['Broadcast'],
    }),
    createBroadcast: build.mutation<SuccessResponse, Partial<IBroadcast>>({
      query: (body) => ({ url: 'admin/broadcasts', method: 'POST', body }),
      invalidatesTags: ['Broadcast'],
    }),
    updateBroadcast: build.mutation<SuccessResponse, { id: string; body: Partial<IBroadcast> }>({
      query: ({ id, body }) => ({ url: `admin/broadcasts/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Broadcast'],
    }),
    deleteBroadcast: build.mutation<SuccessResponse, string>({
      query: (id) => ({ url: `admin/broadcasts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Broadcast'],
    }),
    getAutomatedNotifications: build.query<IAutomatedNotification[], void>({
      query: () => 'admin/notifications/automated',
      providesTags: ['Notification'],
    }),
    createAutomatedNotification: build.mutation<SuccessResponse, Partial<IAutomatedNotification>>({
      query: (body) => ({ url: 'admin/notifications/automated', method: 'POST', body }),
      invalidatesTags: ['Notification'],
    }),
    updateAutomatedNotification: build.mutation<
      SuccessResponse,
      { id: string; body: Partial<IAutomatedNotification> }
    >({
      query: ({ id, body }) => ({
        url: `admin/notifications/automated/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Notification'],
    }),
    getOverviewAnalytics: build.query<IOverviewStats, void>({
      query: () => 'admin/analytics/overview',
      providesTags: ['Analytics'],
    }),
    getGrowthAnalytics: build.query<IGrowthDataPoint[], { months?: number }>({
      query: ({ months } = {}) =>
        `admin/analytics/growth${months ? `?months=${months}` : ''}`,
      providesTags: ['Analytics'],
    }),
    getUserDistribution: build.query<IUserDistribution, void>({
      query: () => 'admin/analytics/user-distribution',
      providesTags: ['Analytics'],
    }),
    getTransactionBreakdown: build.query<ITransactionBreakdown, void>({
      query: () => 'admin/analytics/transaction-breakdown',
      providesTags: ['Analytics'],
    }),
    getRecentSignups: build.query<IRecentSignup[], { limit?: number }>({
      query: ({ limit = 10 } = {}) => `admin/analytics/recent-signups?limit=${limit}`,
      providesTags: ['Analytics'],
    }),
    getTopStores: build.query<ITopStore[], { limit?: number }>({
      query: ({ limit = 10 } = {}) => `admin/analytics/top-stores?limit=${limit}`,
      providesTags: ['Analytics'],
    }),
    getOrderBreakdown: build.query<IOrderBreakdown, void>({
      query: () => 'admin/analytics/order-breakdown',
      providesTags: ['Analytics'],
    }),
    getRevenueAnalytics: build.query<IGrowthDataPoint[], { months?: number }>({
      query: ({ months } = {}) => `admin/analytics/revenue${months ? `?months=${months}` : ''}`,
      providesTags: ['Analytics'],
    }),
    getSignupMethods: build.query<ISignupMethod[], void>({
      query: () => 'admin/analytics/signup-methods',
      providesTags: ['Analytics'],
    }),
    getSystemLogs: build.query<IPaginatedData<ISystemLog>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 30 } = {}) =>
        `admin/logs?page=${page}&limit=${limit}`,
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useUpdateUserStatusMutation,
  useGetAdminVendorsQuery,
  useUpdateVendorStatusMutation,
  useGetAdminOrdersQuery,
  useUpdateAdminOrderStatusMutation,
  useGetAdminTransactionsQuery,
  useFlagTransactionMutation,
  useGetAdminPayoutsQuery,
  useGetAdminEscrowsQuery,
  useMarkEscrowTransferredMutation,
  useGetAdminSchoolZonesQuery,
  useGetAdminZoneStatsQuery,
  useApproveSchoolZoneMutation,
  useGetBroadcastsQuery,
  useCreateBroadcastMutation,
  useUpdateBroadcastMutation,
  useDeleteBroadcastMutation,
  useGetAutomatedNotificationsQuery,
  useCreateAutomatedNotificationMutation,
  useUpdateAutomatedNotificationMutation,
  useGetOverviewAnalyticsQuery,
  useGetGrowthAnalyticsQuery,
  useGetUserDistributionQuery,
  useGetTransactionBreakdownQuery,
  useGetRecentSignupsQuery,
  useGetTopStoresQuery,
  useGetOrderBreakdownQuery,
  useGetRevenueAnalyticsQuery,
  useGetSignupMethodsQuery,
  useGetSystemLogsQuery,
} = adminApi;

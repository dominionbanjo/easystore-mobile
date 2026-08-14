import { apiManager } from './client';
import type { SuccessResponse, IPaginatedData } from '@/types/api';
import type { PermissionCode } from '@/constants/permissions';
import type {
  IInviteStaffPayload,
  IStaffMember,
  IStaffPermissionsResponse,
  IStaffProfile,
  IChangePasswordPayload,
} from '@/types/staff';
import type { IStaffSummary } from '@/types/order';

export const staffApi = apiManager.injectEndpoints({
  endpoints: (build) => ({
    getStaff: build.query<
      IPaginatedData<IStaffMember>,
      { page?: number; limit?: number; search?: string; status?: string }
    >({
      query: ({ page = 1, limit = 20, search, status } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        return `store/staff?${params.toString()}`;
      },
      providesTags: ['Staff'],
    }),
    getStaffMember: build.query<IStaffMember, string>({
      query: (id) => `store/staff/${id}`,
      providesTags: ['Staff'],
    }),
    inviteStaff: build.mutation<SuccessResponse, IInviteStaffPayload>({
      query: (body) => ({ url: 'store/staff/invite', method: 'POST', body }),
      invalidatesTags: ['Staff'],
    }),
    updateStaffMember: build.mutation<
      SuccessResponse,
      { id: string; body: { first_name?: string; last_name?: string } }
    >({
      query: ({ id, body }) => ({ url: `store/staff/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Staff'],
    }),
    updateStaffPermissions: build.mutation<
      SuccessResponse,
      { id: string; permissions: PermissionCode[] }
    >({
      query: ({ id, permissions }) => ({
        url: `store/staff/${id}/permissions`,
        method: 'PATCH',
        body: { permissions },
      }),
      invalidatesTags: ['Staff'],
    }),
    suspendStaff: build.mutation<SuccessResponse, string>({
      query: (id) => ({ url: `store/staff/${id}/suspend`, method: 'PATCH' }),
      invalidatesTags: ['Staff'],
    }),
    unsuspendStaff: build.mutation<SuccessResponse, string>({
      query: (id) => ({ url: `store/staff/${id}/unsuspend`, method: 'PATCH' }),
      invalidatesTags: ['Staff'],
    }),
    resetStaffPassword: build.mutation<SuccessResponse, string>({
      query: (id) => ({ url: `store/staff/${id}/reset-password`, method: 'POST' }),
      invalidatesTags: ['Staff'],
    }),
    deleteStaff: build.mutation<SuccessResponse, string>({
      query: (id) => ({ url: `store/staff/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Staff'],
    }),
    getStaffPermissions: build.query<IStaffPermissionsResponse, void>({
      query: () => 'staff/permissions',
    }),
    getStaffMe: build.query<IStaffProfile, void>({
      query: () => 'staff/me',
      providesTags: ['Staff'],
    }),
    updateStaffMe: build.mutation<
      SuccessResponse,
      { first_name?: string; last_name?: string; phone_number?: string }
    >({
      query: (body) => ({ url: 'staff/me', method: 'PATCH', body }),
      invalidatesTags: ['Staff'],
    }),
    changeStaffPassword: build.mutation<SuccessResponse, IChangePasswordPayload>({
      query: (body) => ({ url: 'staff/me/change-password', method: 'POST', body }),
    }),
    getStaffSummary: build.query<IStaffSummary, void>({
      query: () => 'staff/summary',
      providesTags: ['Analytics', 'Sales'],
    }),
  }),
});

export const {
  useGetStaffQuery,
  useGetStaffMemberQuery,
  useInviteStaffMutation,
  useUpdateStaffMemberMutation,
  useUpdateStaffPermissionsMutation,
  useSuspendStaffMutation,
  useUnsuspendStaffMutation,
  useResetStaffPasswordMutation,
  useDeleteStaffMutation,
  useGetStaffPermissionsQuery,
  useGetStaffMeQuery,
  useUpdateStaffMeMutation,
  useChangeStaffPasswordMutation,
  useGetStaffSummaryQuery,
} = staffApi;

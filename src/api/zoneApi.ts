import { apiManager } from './client';
import type { SuccessResponse, IPaginatedData } from '@/types/api';
import type { IProduct } from '@/types/product';
import type {
  ISchoolZone,
  ISchoolZoneDetail,
  IMyMembership,
  IZoneApplicationPayload,
  IZoneCreationPayload,
  IZoneMember,
  IZoneStore,
} from '@/types/zone';

export const zoneApi = apiManager.injectEndpoints({
  endpoints: (build) => ({
    getZones: build.query<IPaginatedData<ISchoolZone>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => `school-zones?page=${page}&limit=${limit}`,
      providesTags: ['SchoolZone'],
    }),
    getZoneByIdentifier: build.query<ISchoolZoneDetail, string>({
      query: (identifier) => `school-zones/${identifier}`,
      providesTags: ['SchoolZone'],
    }),
    getZoneStores: build.query<IPaginatedData<IZoneStore>, string>({
      query: (identifier) => `school-zones/${identifier}/stores`,
      providesTags: ['SchoolZone'],
    }),
    getZoneProducts: build.query<
      IPaginatedData<IProduct>,
      { identifier: string; page?: number; limit?: number }
    >({
      query: ({ identifier, page = 1, limit = 20 }) =>
        `school-zones/${identifier}/products?page=${page}&limit=${limit}`,
      providesTags: ['SchoolZone'],
    }),
    getMyMemberships: build.query<IPaginatedData<IMyMembership>, void>({
      query: () => 'school-zones/me/memberships',
      providesTags: ['SchoolZone'],
    }),
    getMyCreatedZones: build.query<IPaginatedData<ISchoolZone>, void>({
      query: () => 'school-zones/me/created',
      providesTags: ['SchoolZone'],
    }),
    createZone: build.mutation<SuccessResponse & { id?: string }, IZoneCreationPayload>({
      query: (body) => ({ url: 'school-zones', method: 'POST', body }),
      invalidatesTags: ['SchoolZone'],
    }),
    applyToZone: build.mutation<SuccessResponse, { zoneId: string; body: IZoneApplicationPayload }>({
      query: ({ zoneId, body }) => ({
        url: `school-zones/${zoneId}/apply`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SchoolZone'],
    }),
    leaveZone: build.mutation<SuccessResponse, string>({
      query: (zoneId) => ({ url: `school-zones/${zoneId}/leave`, method: 'DELETE' }),
      invalidatesTags: ['SchoolZone'],
    }),
    getAdminZones: build.query<ISchoolZone[], void>({
      query: () => 'school-zones/admin/mine',
      providesTags: ['SchoolZone'],
    }),
    getZoneMembers: build.query<IPaginatedData<IZoneMember>, string>({
      query: (zoneId) => `school-zones/${zoneId}/members`,
      providesTags: ['SchoolZone'],
    }),
    decideZoneMember: build.mutation<
      SuccessResponse,
      { zoneId: string; memberId: string; body: { decision: 'approve' | 'reject' } }
    >({
      query: ({ zoneId, memberId, body }) => ({
        url: `school-zones/${zoneId}/members/${memberId}/decision`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SchoolZone'],
    }),
    suspendZoneMember: build.mutation<SuccessResponse, { zoneId: string; memberId: string }>({
      query: ({ zoneId, memberId }) => ({
        url: `school-zones/${zoneId}/members/${memberId}/suspend`,
        method: 'POST',
      }),
      invalidatesTags: ['SchoolZone'],
    }),
    unsuspendZoneMember: build.mutation<SuccessResponse, { zoneId: string; memberId: string }>({
      query: ({ zoneId, memberId }) => ({
        url: `school-zones/${zoneId}/members/${memberId}/unsuspend`,
        method: 'POST',
      }),
      invalidatesTags: ['SchoolZone'],
    }),
  }),
});

export const {
  useGetZonesQuery,
  useGetZoneByIdentifierQuery,
  useGetZoneStoresQuery,
  useGetZoneProductsQuery,
  useGetMyMembershipsQuery,
  useGetMyCreatedZonesQuery,
  useCreateZoneMutation,
  useApplyToZoneMutation,
  useLeaveZoneMutation,
  useGetAdminZonesQuery,
  useGetZoneMembersQuery,
  useDecideZoneMemberMutation,
  useSuspendZoneMemberMutation,
  useUnsuspendZoneMemberMutation,
} = zoneApi;

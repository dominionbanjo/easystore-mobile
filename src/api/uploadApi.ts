import { apiManager } from './client';
import type { SuccessResponse } from '@/types/api';

export interface ICloudinarySignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export const uploadApi = apiManager.injectEndpoints({
  endpoints: (build) => ({
    getCloudinarySignature: build.query<ICloudinarySignature, { subfolder?: string }>({
      query: ({ subfolder }) => {
        const params = new URLSearchParams();
        if (subfolder) params.set('subfolder', subfolder);
        return `uploads/cloudinary-signature?${params.toString()}`;
      },
    }),
    deleteCloudinaryAsset: build.mutation<SuccessResponse, { public_id: string }>({
      query: (body) => ({ url: 'uploads/cloudinary', method: 'DELETE', body }),
    }),
  }),
});

export const { useGetCloudinarySignatureQuery, useDeleteCloudinaryAssetMutation } = uploadApi;

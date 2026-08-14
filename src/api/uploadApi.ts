import { apiManager } from './client';

export interface ICloudinarySignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export interface IDeleteCloudinaryAssetResponse {
  status: 'success';
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
    deleteCloudinaryAsset: build.mutation<IDeleteCloudinaryAssetResponse, { public_id: string }>({
      query: (body) => ({ url: 'uploads/cloudinary', method: 'DELETE', body }),
    }),
  }),
});

export const { useGetCloudinarySignatureQuery, useDeleteCloudinaryAssetMutation } = uploadApi;

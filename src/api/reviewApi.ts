import { apiManager } from './client';
import type { IProductReview } from '@/types/product';
import type { SuccessResponse, IPaginatedData } from '@/types/api';

export const reviewApi = apiManager.injectEndpoints({
  endpoints: (build) => ({
    getProductReviews: build.query<IPaginatedData<IProductReview>, string>({
      query: (productId) => `products/${productId}/reviews?limit=20`,
      providesTags: ['Reviews'],
    }),
    createProductReview: build.mutation<
      SuccessResponse,
      { productId: string; rating: number; comment?: string }
    >({
      query: ({ productId, ...body }) => ({
        url: `products/${productId}/reviews`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Reviews', 'Product'],
    }),
    deleteProductReview: build.mutation<SuccessResponse, { productId: string; reviewId: string }>({
      query: ({ productId, reviewId }) => ({
        url: `products/${productId}/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reviews'],
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useCreateProductReviewMutation,
  useDeleteProductReviewMutation,
} = reviewApi;

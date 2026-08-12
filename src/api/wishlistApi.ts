import { apiManager } from './client';
import type { IWishlistItem } from '@/types/cart';
import type { SuccessResponse } from '@/types/api';

export const wishlistApi = apiManager.injectEndpoints({
  endpoints: (build) => ({
    getWishlist: build.query<IWishlistItem[], void>({
      query: () => 'wishlist',
      providesTags: ['Wishlist'],
    }),
    addToWishlist: build.mutation<SuccessResponse, { product_id: string }>({
      query: (body) => ({ url: 'wishlist', method: 'POST', body }),
      invalidatesTags: ['Wishlist', 'Product'],
    }),
    removeFromWishlist: build.mutation<SuccessResponse, string>({
      query: (productId) => ({ url: `wishlist/${productId}`, method: 'DELETE' }),
      invalidatesTags: ['Wishlist', 'Product'],
    }),
    moveWishlistToCart: build.mutation<SuccessResponse, void>({
      query: () => ({ url: 'wishlist/move-to-cart', method: 'POST' }),
      invalidatesTags: ['Wishlist', 'Cart'],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useMoveWishlistToCartMutation,
} = wishlistApi;

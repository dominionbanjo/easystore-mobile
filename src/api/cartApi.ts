import { apiManager } from './client';
import type { ICart, IAddToCartPayload, IUpdateCartPayload } from '@/types/cart';
import type { SuccessResponse } from '@/types/api';

export const cartApi = apiManager.injectEndpoints({
  endpoints: (build) => ({
    getCart: build.query<ICart, void>({
      query: () => 'cart',
      providesTags: ['Cart'],
    }),
    addCartItem: build.mutation<SuccessResponse, IAddToCartPayload>({
      query: (body) => ({ url: 'cart/items', method: 'POST', body }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: build.mutation<
      SuccessResponse,
      { productId: string; body: IUpdateCartPayload }
    >({
      query: ({ productId, body }) => ({
        url: `cart/items/${productId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: build.mutation<SuccessResponse, string>({
      query: (productId) => ({
        url: `cart/items/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: build.mutation<SuccessResponse, void>({
      query: () => ({ url: 'cart', method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApi;

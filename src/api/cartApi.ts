import { apiManager } from './client';
import type {
  ICartResponse,
  IAddToCartPayload,
  IUpdateCartPayload,
} from '@/types/cart';

export const cartApi = apiManager.injectEndpoints({
  endpoints: (build) => ({
    getCart: build.query<ICartResponse, void>({
      query: () => 'cart',
      providesTags: ['Cart'],
    }),
    addCartItem: build.mutation<ICartResponse, IAddToCartPayload>({
      query: (body) => ({ url: 'cart/items', method: 'POST', body }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: build.mutation<
      ICartResponse,
      { productId: string; body: IUpdateCartPayload }
    >({
      query: ({ productId, body }) => ({
        url: `cart/items/${productId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: build.mutation<ICartResponse, string>({
      query: (productId) => ({
        url: `cart/items/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: build.mutation<ICartResponse, void>({
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

import { apiManager } from './client';
import type { SuccessResponse, IPaginatedData } from '@/types/api';
import type {
  ICreateProductPayload,
  IProduct,
  IProductDetails,
  IProductDraft,
  IProductSearchParams,
  IProductVariantInput,
  IStoreProduct,
  ISalesTerminalProduct,
  IUpdateProductPayload,
  IVendorProductParams,
} from '@/types/product';

export const productApi = apiManager.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<IPaginatedData<IProduct>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => `product?page=${page}&limit=${limit}`,
      providesTags: ['Product'],
    }),
    getFeaturedProducts: build.query<IProduct[], void>({
      query: () => 'product/featured',
      transformResponse: (response: IPaginatedData<IProduct>) => response.items,
      providesTags: ['Product'],
    }),
    getProductsByCategory: build.query<
      IPaginatedData<IProduct>,
      { identifier: string; page?: number; limit?: number }
    >({
      query: ({ identifier, page = 1, limit = 20 }) =>
        `product/category/${identifier}?page=${page}&limit=${limit}`,
      providesTags: ['Product'],
    }),
    getProductBySlug: build.query<IProductDetails, string>({
      query: (identifier) => `product/${identifier}`,
      providesTags: (_result, _err, identifier) => [{ type: 'Product', id: identifier }],
    }),
    searchProducts: build.query<IPaginatedData<IProduct>, IProductSearchParams>({
      query: (params) => {
        const query = new URLSearchParams();
        if (params.q) query.set('q', params.q);
        if (params.category) query.set('category', params.category);
        if (params.sort) query.set('sort', params.sort);
        if (params.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
        if (params.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
        if (params.rating !== undefined) query.set('rating', String(params.rating));
        if (params.inStock !== undefined) query.set('inStock', String(params.inStock));
        if (params.onSale !== undefined) query.set('onSale', String(params.onSale));
        query.set('page', String(params.page ?? 1));
        query.set('limit', String(params.limit ?? 20));
        return `product/search?${query.toString()}`;
      },
      providesTags: ['Product'],
    }),
    getStoreProducts: build.query<
      IPaginatedData<IProduct>,
      { storeId: string; page?: number; limit?: number }
    >({
      query: ({ storeId, page = 1, limit = 20 }) =>
        `store/${storeId}/products?page=${page}&limit=${limit}`,
      providesTags: ['Product'],
    }),
    getVendorProducts: build.query<IPaginatedData<IStoreProduct>, IVendorProductParams>({
      query: (params = {}) => {
        const query = new URLSearchParams();
        query.set('page', String(params.page ?? 1));
        query.set('limit', String(params.limit ?? 20));
        if (params.status) query.set('status', params.status);
        if (params.search) query.set('search', params.search);
        if (params.sort) query.set('sort', params.sort);
        return `vendor/products?${query.toString()}`;
      },
      providesTags: ['Product'],
    }),
    createProduct: build.mutation<SuccessResponse, ICreateProductPayload>({
      query: (body) => ({ url: 'vendor/products', method: 'POST', body }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: build.mutation<SuccessResponse, { id: string; body: IUpdateProductPayload }>({
      query: ({ id, body }) => ({ url: `vendor/products/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Product'],
    }),
    updateProductStatus: build.mutation<
      SuccessResponse,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `vendor/products/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Product'],
    }),
    toggleProductOnSale: build.mutation<SuccessResponse, { id: string; on_sale: boolean }>({
      query: ({ id, on_sale }) => ({
        url: `vendor/products/${id}/on-sale`,
        method: 'PATCH',
        body: { on_sale },
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: build.mutation<SuccessResponse, string>({
      query: (id) => ({ url: `vendor/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Product'],
    }),
    getProductDrafts: build.query<IPaginatedData<IProductDraft>, { page?: number; limit?: number }>(
      {
        query: ({ page = 1, limit = 20 } = {}) =>
          `vendor/products/drafts?page=${page}&limit=${limit}`,
        providesTags: ['Draft'],
      },
    ),
    saveProductDraft: build.mutation<SuccessResponse, IProductDraft>({
      query: (body) => ({ url: 'vendor/products/drafts', method: 'POST', body }),
      invalidatesTags: ['Draft'],
    }),
    publishProductDraft: build.mutation<SuccessResponse, string>({
      query: (id) => ({
        url: `vendor/products/drafts/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: ['Draft', 'Product'],
    }),
    deleteProductDraft: build.mutation<SuccessResponse, string>({
      query: (id) => ({ url: `vendor/products/drafts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Draft'],
    }),
    getBarcodeProduct: build.query<IProductDetails, string>({
      query: (code) => `vendor/products/barcode/${encodeURIComponent(code)}`,
      providesTags: ['Product'],
    }),
    getSalesTerminalProducts: build.query<
      IPaginatedData<ISalesTerminalProduct>,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 50, search } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.set('search', search);
        return `vendor/products/sales-terminal?${params.toString()}`;
      },
      providesTags: ['Product'],
    }),
    getSalesTerminalCategories: build.query<{ id: string; name: string }[], void>({
      query: () => 'vendor/products/sales-terminal/categories',
      providesTags: ['Categories'],
    }),
    createVariants: build.mutation<
      SuccessResponse,
      { productId: string; variants: IProductVariantInput[] }
    >({
      query: ({ productId, variants }) => ({
        url: `vendor/products/${productId}/variants`,
        method: 'POST',
        body: { variants },
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetFeaturedProductsQuery,
  useGetProductsByCategoryQuery,
  useGetProductBySlugQuery,
  useSearchProductsQuery,
  useGetStoreProductsQuery,
  useGetVendorProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductStatusMutation,
  useToggleProductOnSaleMutation,
  useDeleteProductMutation,
  useGetProductDraftsQuery,
  useSaveProductDraftMutation,
  usePublishProductDraftMutation,
  useDeleteProductDraftMutation,
  useGetBarcodeProductQuery,
  useGetSalesTerminalProductsQuery,
  useGetSalesTerminalCategoriesQuery,
} = productApi;

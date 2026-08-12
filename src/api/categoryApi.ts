import { apiManager } from './client';
import type { ICategory, IColor } from '@/types/product';

export const categoryApi = apiManager.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<ICategory[], void>({
      query: () => 'categories',
      providesTags: ['Categories'],
    }),
    getCategoryByIdentifier: build.query<ICategory, string>({
      query: (identifier) => `categories/${identifier}`,
      providesTags: ['Categories'],
    }),
    getColors: build.query<IColor[], void>({
      query: () => 'colors',
      providesTags: ['Colors'],
    }),
  }),
});

export const { useGetCategoriesQuery, useGetCategoryByIdentifierQuery, useGetColorsQuery } =
  categoryApi;

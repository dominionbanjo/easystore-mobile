import { apiManager } from './client';
import type { IPaginatedData } from '@/types/api';
import type { IRecommendedProduct, ISavePreferencesPayload } from '@/types/recommendation';

export interface IRecommendationPreferences {
  category_ids: string[];
}

export const recommendationApi = apiManager.injectEndpoints({
  endpoints: (build) => ({
    getForYou: build.query<IRecommendedProduct[], void>({
      query: () => 'recommendations/for-you',
      transformResponse: (response: IPaginatedData<IRecommendedProduct>) => response.items,
      providesTags: ['Product'],
    }),
    getTrendingRecommendations: build.query<IRecommendedProduct[], void>({
      query: () => 'recommendations/trending',
      transformResponse: (response: IPaginatedData<IRecommendedProduct>) => response.items,
      providesTags: ['Product'],
    }),
    getDeals: build.query<IRecommendedProduct[], void>({
      query: () => 'recommendations/deals',
      transformResponse: (response: IPaginatedData<IRecommendedProduct>) => response.items,
      providesTags: ['Product'],
    }),
    getPreferences: build.query<IRecommendationPreferences, void>({
      query: () => 'recommendations/preferences',
    }),
    savePreferences: build.mutation<{ success: boolean }, ISavePreferencesPayload>({
      query: (body) => ({ url: 'recommendations/preferences', method: 'POST', body }),
    }),
  }),
});

export const {
  useGetForYouQuery,
  useGetTrendingRecommendationsQuery,
  useGetDealsQuery,
  useGetPreferencesQuery,
  useSavePreferencesMutation,
} = recommendationApi;

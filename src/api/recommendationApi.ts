import { apiManager } from './client';
import type { IRecommendedProduct, ISavePreferencesPayload } from '@/types/recommendation';

export interface IRecommendationPreferences {
  category_ids: string[];
}

export const recommendationApi = apiManager.injectEndpoints({
  endpoints: (build) => ({
    getForYou: build.query<IRecommendedProduct[], void>({
      query: () => 'recommendations/for-you',
      providesTags: ['Product'],
    }),
    getTrendingRecommendations: build.query<IRecommendedProduct[], void>({
      query: () => 'recommendations/trending',
      providesTags: ['Product'],
    }),
    getDeals: build.query<IRecommendedProduct[], void>({
      query: () => 'recommendations/deals',
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

export interface IRecommendedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount_price?: number;
  image?: string;
  rating_average?: string;
  store_name?: string;
  store_slug?: string;
  reason?: string;
  is_in_wishlist?: boolean;
}

export interface ISavePreferencesPayload {
  category_ids: string[];
}

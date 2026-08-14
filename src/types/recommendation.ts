import type { IProduct } from './product';

/** Recommendation items are product-card payloads (category is a name string). */
export type IRecommendedProduct = IProduct;

export interface ISavePreferencesPayload {
  category_ids: string[];
}

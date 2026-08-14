export interface ICartItem {
  product_id: string;
  vendor_id: string;
  store_id: string | null;
  name: string;
  slug: string;
  /** Naira (backend divides kobo by 100 before returning). */
  price: number;
  /** Naira or null (backend divides kobo by 100 before returning). */
  discount_price: number | null;
  /** Authoritative resolved price in kobo (never divided). */
  unit_price: number;
  image: string | null;
  variant_id?: string | null;
  variant_options?: Record<string, string> | null;
  quantity: number;
  size: string | null;
  color: string | null;
  color_hex?: string | null;
  installment_enabled?: boolean;
  installment_presets?: string[];
}

export interface ICart {
  id?: string;
  items: ICartItem[];
  subtotal: number;
  shipping: number;
  platform_fee?: number;
  total: number;
}

export interface ICartResponse {
  cart: ICart;
}

/** Local-only guest cart item (subset produced by the product detail flow). */
export interface IGuestCartItem {
  product_id: string;
  name: string;
  slug: string;
  /** Naira (product detail normalizes kobo → naira). */
  price: number;
  discount_price?: number;
  image: string | null;
  quantity: number;
  variant_id?: string;
  variant_options?: Record<string, string>;
  size?: string;
  color?: string;
  installment_enabled?: boolean;
  installment_presets?: string[];
}

export interface IAddToCartPayload {
  product_id: string;
  variant_id?: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface IUpdateCartPayload {
  quantity: number;
  variant_id?: string | null;
}

export interface IWishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: string;
  image: string | null;
  rating_average?: string;
  stock?: number;
  discount_price?: string | null;
  on_sale?: boolean;
  options?: Record<string, string[]>;
  created_at?: string;
}

export interface IWishlistStore {
  id: string;
  store_name: string;
  slug: string;
}

export interface IWishlistItem {
  id: string;
  product_id: string;
  name: string;
  image: string | null;
  /** Snapshot price in kobo (numeric column serializes as string). */
  price: string;
  created_at: string;
  product?: IWishlistProduct;
  store?: IWishlistStore;
}

export interface IWishlistResponse {
  wishlist: IWishlistItem[];
}

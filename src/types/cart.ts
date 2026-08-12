export interface ICartItem {
  product_id: string;
  vendor_id?: string;
  store_id?: string;
  name: string;
  slug: string;
  price: number;
  discount_price?: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
  color_hex?: string;
  variant_id?: string;
  variant_options?: Record<string, string>;
  installment_enabled?: boolean;
  installment_presets?: { id: string; name: string; count: number; interval_days: number }[];
}

export interface ICart {
  id?: string;
  items: ICartItem[];
  subtotal: number;
  shipping: number;
  platform_fee?: number;
  total: number;
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
  variant_id?: string;
}

export interface IWishlistItem {
  id?: string;
  product_id: string;
  name: string;
  image?: string;
  price: number;
  is_in_wishlist?: boolean;
  slug?: string;
}

export interface IProductImage {
  url: string;
  public_id?: string;
}

export interface IProductOption {
  name: string;
  values: string[];
}

export interface IProductVariant {
  id: string;
  sku?: string;
  barcode?: string;
  combinations?: Record<string, string>;
  /** Naira on card/detail endpoints; kobo on raw vendor endpoints. */
  price: number;
  discount_price?: number | null;
  stock: number;
  image_url?: string;
  image_public_id?: string;
}

export interface IProduct {
  id: string;
  name: string;
  slug: string;
  /** Naira on card endpoints (backend divides kobo by 100); nullable on vendor lists. */
  price: number | null;
  discount_price?: number | null;
  /** Card endpoints return number; raw entity endpoints return string (numeric column). */
  rating_average?: number | string;
  stock?: number;
  image?: string | IProductImage | null;
  store_name?: string;
  store_slug?: string;
  is_in_wishlist?: boolean;
  on_sale?: boolean;
  featured?: boolean;
  options?: IProductOption[];
  variants?: Pick<
    IProductVariant,
    'id' | 'price' | 'discount_price' | 'stock' | 'combinations' | 'image_url'
  >[];
  /** Category NAME on card endpoints (not an object). */
  category?: string;
  created_at?: string;
}

export interface IProductDetails extends IProduct {
  vendor_id: string;
  store_id: string;
  category_id?: string;
  /** Full category relation object on the detail endpoint. */
  category_ref?: { id: string; name: string; slug?: string } | null;
  description?: string;
  tags?: string[];
  /** JSONB column `{url, public_id}` on raw-entity endpoints. */
  image: IProductImage | null;
  gallery?: IProductImage[];
  highlights?: string[];
  specs?: Record<string, string>;
  shipping_note?: string;
  returns_note?: string;
  installment_enabled?: boolean;
  installment_preset_id?: string;
  installment_presets?: string[];
  rating_count?: number;
  review_count?: number;
  total_sold?: number;
  status?: 'active' | 'inactive' | 'draft';
  is_out_of_stock?: boolean;
  barcode?: string;
}

export interface IProductDetailStore {
  id: string;
  store_name: string;
  slug: string;
  address_city?: string | null;
  address_state?: string | null;
  address_country?: string | null;
  address_postal_code?: string | null;
}

/** Full `GET product/:identifier` payload — product + store + reviews + related products. */
export interface IProductDetailResponse {
  product?: IProductDetails;
  store?: IProductDetailStore | null;
  reviews?: IProductReview[];
  related_products?: IProduct[];
}

export interface IStoreProduct extends IProduct {
  status: 'active' | 'inactive' | 'draft';
  is_out_of_stock: boolean;
  /** Full category relation object on the vendor list endpoint. */
  category_ref?: { id: string; name: string; slug?: string } | null;
  stock: number;
  /** Naira or null (backend divides kobo by 100). */
  price: number | null;
  discount_price: number | null;
  /** Raw JSONB column. */
  image: IProductImage | null;
  rating_average: number;
  total_sold?: number;
  featured?: boolean;
  on_sale?: boolean;
  updated_at?: string;
}

export interface IProductVariantInput {
  id?: string;
  sku?: string;
  barcode?: string;
  combinations?: Record<string, string>;
  price: number;
  discount_price?: number;
  stock: number;
  image_url?: string;
  image_public_id?: string;
}

export interface ICreateProductPayload {
  category_id: string;
  name: string;
  barcode?: string;
  description?: string;
  price?: number;
  discount_price?: number;
  stock?: number;
  installment_enabled?: boolean;
  installment_presets?: string[];
  shipping_note?: string;
  returns_note?: string;
  tags?: string[];
  image?: IProductImage;
  gallery?: IProductImage[];
  highlights?: string[];
  specs?: Record<string, string>;
  options?: IProductOption[];
  variants?: IProductVariantInput[];
}

export interface IUpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  discount_price?: number;
  stock?: number;
  barcode?: string;
  tags?: string[];
  image?: IProductImage | null;
  gallery?: IProductImage[] | null;
  highlights?: string[];
  specs?: Record<string, string>;
  options?: IProductOption[];
  variants?: IProductVariantInput[] | null;
  shipping_note?: string;
  returns_note?: string;
  installment_enabled?: boolean;
  installment_presets?: string[];
}

export interface IProductDraft {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  /** Naira or null. */
  price?: number | null;
  discount_price?: number | null;
  stock?: number;
  /** Raw JSONB column. */
  image?: IProductImage | null;
  gallery?: IProductImage[] | null;
  tags?: string[];
  highlights?: string[];
  specs?: Record<string, string>;
  options?: IProductOption[];
  status?: 'draft';
  category_id?: string;
  shipping_note?: string;
  returns_note?: string;
  updated_at?: string;
  created_at?: string;
}

/** `GET vendor/products/drafts` — backend key is `drafts`, not `items`. */
export interface IProductDraftList {
  drafts: IProductDraft[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface IBarcodeVariant {
  id: string;
  /** Kobo (raw numeric column serializes as string). */
  price: string;
  stock: number;
  combinations?: Record<string, string>;
  image_url?: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    image: IProductImage | null;
    store_id: string;
    status: string;
  };
}

export interface IBarcodeProductResult {
  product: {
    id: string;
    name: string;
    slug: string;
    /** Kobo (raw numeric column serializes as string). */
    price: string;
    image: IProductImage | null;
    stock: number;
  };
  variant: IBarcodeVariant | null;
}

export interface IProductStatusResponse {
  status: string;
}

export interface IProductOnSaleResponse {
  on_sale: boolean;
}

export interface IProductSearchParams {
  q?: string;
  category?: string;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating_desc' | 'date_desc';
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  onSale?: boolean;
  store_id?: string;
  state?: string;
}

export interface IVendorProductParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sort?: string;
}

export interface ISalesTerminalProduct {
  id: string;
  name: string;
  slug: string;
  /** Kobo (backend does NOT divide by 100). */
  price: number;
  image: string | null;
  stock: number;
  /** Category NAME (not an object). */
  category: string | null;
  options?: IProductOption[];
  variants?: Pick<IProductVariant, 'id' | 'price' | 'stock' | 'combinations' | 'image_url'>[];
}

/** `GET vendor/products/sales-terminal/categories` — no `id`, name only + count. */
export interface ISalesTerminalCategory {
  name: string;
  count: number;
}

export interface IProductReview {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
}

export interface ICategory {
  id: string;
  name: string;
  slug?: string;
  products_count?: number;
  children?: ICategoryChild[];
}

export interface ICategoryChild {
  id: string;
  name: string;
  slug?: string;
  products_count?: number;
}

export interface IColor {
  id: string;
  name: string;
  hex: string;
}

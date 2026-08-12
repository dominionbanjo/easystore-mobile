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
  price: number;
  discount_price?: number;
  stock: number;
  image_url?: string;
  image_public_id?: string;
}

export interface IProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount_price?: number;
  rating_average?: string;
  stock?: number;
  image?: string;
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
  category?: {
    id: string;
    name: string;
    slug?: string;
  };
  created_at?: string;
}

export interface IProductDetails extends IProduct {
  vendor_id: string;
  store_id: string;
  category_id?: string;
  category_ref?: string;
  description?: string;
  tags?: string[];
  gallery?: IProductImage[];
  highlights?: string[];
  specs?: Record<string, string>;
  shipping_note?: string;
  returns_note?: string;
  installment_enabled?: boolean;
  installment_preset_id?: string;
  installment_presets?: { id: string; name: string; count: number; interval_days: number }[];
  rating_count?: number;
  review_count?: number;
  total_sold?: number;
  status?: 'active' | 'inactive' | 'draft';
  is_out_of_stock?: boolean;
  barcode?: string;
}

export interface IStoreProduct extends IProduct {
  status: 'active' | 'inactive' | 'draft';
  is_out_of_stock: boolean;
  category_ref?: string;
  stock: number;
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
  variants?: IProductVariantInput[];
  shipping_note?: string;
  returns_note?: string;
  installment_enabled?: boolean;
  installment_presets?: string[];
}

export interface IProductDraft {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  image?: IProductImage;
  gallery?: IProductImage[];
  tags?: string[];
  updated_at?: string;
  created_at?: string;
  payload?: Partial<ICreateProductPayload>;
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
  price: number;
  image?: string;
  stock: number;
  category?: { id: string; name: string };
  variants?: Pick<
    IProductVariant,
    'id' | 'price' | 'discount_price' | 'stock' | 'combinations' | 'image_url'
  >[];
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

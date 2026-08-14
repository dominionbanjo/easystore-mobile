import type { IPaginatedData } from './api';
import type { IProduct } from './product';

export interface IStoreAddress {
  street: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
}

export interface IStore {
  id: string;
  store_name: string;
  slug: string;
  subdomain?: string;
  category?: string;
  description?: string;
  logo?: string;
  cover_image?: string;
  rating_average?: string;
  total_products?: number;
  address?: IStoreAddress | null;
  created_at?: string;
}

/** Public store detail (`GET store/:identifier`) — flat address fields, no `address` object. */
export interface IStorePublicDetail {
  id: string;
  user_id: string;
  vendor_id: string;
  store_name: string;
  slug: string;
  subdomain: string | null;
  status: string;
  category: string | null;
  description: string | null;
  logo: string | null;
  cover_image: string | null;
  email: string | null;
  phone_number: string | null;
  social_links: Record<string, string> | null;
  rating_average: string | null;
  rating_count: number;
  address_city: string | null;
  address_state: string | null;
  address_country: string | null;
  address_postal_code: string | null;
  total_products: number;
  payout_verified: boolean;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
    username?: string;
    avatar?: string;
  } | null;
  theme: {
    template?: { id: string; name: string } | null;
    custom_config?: Record<string, string>;
  };
}

export interface IStoreDetailResponse {
  store: IStorePublicDetail;
  products: IPaginatedData<IProduct> | null;
  categories: { id: string; name: string; slug: string }[];
}

/** Owner view (`GET store/me`) — full entity spread, `setup_stage` is a number (4 = completed). */
export interface IStoreOwnerDetails {
  id: string;
  user_id: string;
  status: 'active' | 'pending' | 'restricted' | 'banned';
  store_name: string;
  slug: string;
  subdomain: string | null;
  category: string | null;
  description: string | null;
  logo: string | null;
  cover_image: string | null;
  email: string | null;
  phone_number: string | null;
  social_links: Record<string, string> | null;
  rating_average: string | null;
  rating_count: number;
  category_ids: string[] | null;
  total_revenue: string | null;
  total_orders: number;
  total_products: number;
  active_customers: number;
  products_listed: number;
  account_number: string | null;
  bank_code: string | null;
  bank_name: string | null;
  recipient_code: string | null;
  settlement_email: string | null;
  payout_verified: boolean;
  escrow_enabled: boolean;
  installments_enabled: boolean;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_country: string | null;
  address_postal_code: string | null;
  setup_stage: number;
  last_bank_update: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    avatar: string;
    account_status: string;
  };
}

export interface IStoreThemeSetting {
  id: string;
  store_id: string;
  template_id: string | null;
  custom_config?: Record<string, string>;
}

export interface IStoreAnalytics {
  summary: {
    total_sales: number;
    online_sales: number;
    offline_sales: number;
    orders: number;
    customers: number;
    conversion_rate: number;
    total_products: number;
    out_of_stock_count: number;
    pending_orders_count: number;
    pending_payouts: number;
    store_status: string;
    account_status: string;
    id?: string;
    payout_verified: boolean;
    escrow_enabled: boolean;
    installments_enabled: boolean;
  };
  trends: {
    monthly: {
      year: number;
      month: number;
      revenue: string;
      online_revenue: string;
      offline_revenue: string;
      orders: string;
      unique_customers: string;
    }[];
  };
  customers: {
    id: string;
    user_id: string;
    name: string;
    email: string | null;
    location: string | null;
    phone_number: string | null;
    orders: string;
    spent: string;
    rating: string | null;
    last_order_at: string | null;
  }[];
  top_products: {
    product_id: string;
    name: string;
    slug: string;
    image: { url: string; public_id?: string } | null;
    total_sold: string;
    total_revenue: string;
  }[];
}

export interface IVendorCustomer {
  id: string;
  name: string;
  email?: string;
  phone_number?: string;
  location?: string;
  orders_count: number;
  /** Numeric/bigint columns serialize as strings. */
  total_spent: string;
  rating?: string;
  last_order_at?: string;
  created_at?: string;
}

export interface IStoreTemplate {
  id: string;
  name: string;
  description?: string;
}

export interface IStoreThemeConfig {
  template_id?: string;
  custom_config?: Record<string, string>;
}

export interface IDeliveryRate {
  id: string;
  state: string;
  location?: string | null;
  /** Numeric column serializes as string. */
  fee: string;
  duration?: string | null;
  notes?: string | null;
}

/** Request payload for create/update delivery rates — `fee` is kobo. */
export interface IDeliveryRatePayload {
  state: string;
  location?: string;
  fee: number;
  duration?: string | null;
  notes?: string | null;
}

export interface ICreateStorePayload {
  store_name: string;
  email: string;
  category?: string;
  description?: string;
  phone_number?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  escrow_enabled?: boolean;
  installments_enabled?: boolean;
}

export interface IUpdateStorePayload {
  store_name?: string;
  subdomain?: string;
  description?: string;
  category?: string;
  email?: string;
  phone_number?: string;
  website?: string;
  social_links?: Record<string, string>;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_country?: string;
  address_postal_code?: string;
  setup_stage?: number;
  escrow_enabled?: boolean;
  installments_enabled?: boolean;
  logo?: string;
  logo_public_id?: string;
  cover_image?: string;
  cover_image_public_id?: string;
}

export interface IBankRegisterPayload {
  bank_code: string;
  account_number: string;
  settlement_email?: string;
}

export interface IBankVerifyPayload {
  bank_code: string;
  account_number: string;
  settlement_email?: string;
}

export interface IVendorPayout {
  id: string;
  vendor_id?: string;
  order_id?: string;
  escrow_id?: string;
  /** Bigint column serializes as string. */
  amount: string;
  currency: string;
  status: 'pending' | 'pending_manual' | 'success' | 'failed' | 'reversed';
  payout_type: 'auto' | 'manual';
  transfer_code?: string;
  transfer_reference?: string;
  recipient_code?: string;
  transferred_at?: string;
  admin_note?: string;
  created_at?: string;
}

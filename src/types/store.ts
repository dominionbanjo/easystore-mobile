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
  address?: string;
  created_at?: string;
}

export interface IStoreDetails extends IStore {
  user_id: string;
  vendor_id?: string;
  email?: string;
  phone_number?: string;
  website?: string;
  social_links?: Record<string, string>;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_country?: string;
  address_postal_code?: string;
  setup_stage?: string;
  bank_code?: string;
  account_number?: string;
  bank_name?: string;
  recipient_code?: string;
  payout_verified?: boolean;
  escrow_enabled?: boolean;
  installments_enabled?: boolean;
  status?: string;
  user?: { id: string; first_name: string; last_name: string; email: string; avatar?: string };
  theme?: {
    template?: { id: string; name: string };
    custom_config?: Record<string, string>;
  };
  category_ids?: string[];
  total_orders?: number;
  total_revenue?: number;
}

export interface IStoreAnalytics {
  summary: {
    total_sales: number;
    orders: number;
    total_products: number;
    customers: number;
    out_of_stock_count: number;
    pending_orders_count: number;
    conversion_rate?: number;
  };
  trends: {
    monthly: { month: string; revenue: number; orders: number }[];
  };
  top_products: { id: string; name: string; revenue: number; orders: number; image?: string }[];
  customers: { id: string; name: string; orders_count: number; total_spent: number }[];
}

export interface IVendorCustomer {
  id: string;
  name: string;
  email?: string;
  phone_number?: string;
  location?: string;
  orders_count: number;
  total_spent: number;
  rating?: number;
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
  location?: string;
  fee: number;
  duration?: string;
  notes?: string;
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
  setup_stage?: string;
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
  amount: number;
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

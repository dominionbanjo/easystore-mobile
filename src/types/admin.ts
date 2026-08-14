export interface IAdminUser {
  id: string;
  first_name: string;
  last_name: string;
  username?: string;
  email: string;
  account_type: string;
  account_status: string;
  email_verified?: boolean;
  created_at: string;
}

/** Vendor rows are User entities with a nested `stores[]` array. */
export interface IAdminVendor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  account_type: string;
  account_status: string;
  created_at: string;
  stores?: {
    id: string;
    store_name: string;
    logo?: string;
    status: string;
    address_city?: string;
    address_state?: string;
    address_country?: string;
  }[];
}

export interface IAdminTransaction {
  id: string;
  reference?: string;
  type: string;
  /** Bigint column serializes as string. */
  amount: string;
  currency: string;
  status: string;
  description?: string;
  is_flagged?: boolean;
  created_at: string;
  user?: { id: string; first_name: string; last_name: string; username?: string };
  vendor?: {
    id: string;
    first_name: string;
    last_name: string;
    stores?: { id: string; store_name: string }[];
  };
}

/** Both admin payout lists return enriched Payout entities. */
export interface IAdminPayout {
  id: string;
  /** Bigint column serializes as string. */
  amount_kobo: string;
  status: string;
  created_at: string;
  updated_at?: string;
  reference?: string;
  payout_type: string;
  vendor?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  vendor_bank?: {
    store_name: string;
    bank_name?: string | null;
    account_number?: string | null;
    account_name?: string | null;
  } | null;
}

/** `GET admin/analytics/overview` — nested object, not flat keys. */
export interface IOverviewStats {
  totals: {
    users: number;
    vendors: number;
    stores: number;
    products: number;
    orders: number;
  };
  revenue: { thisMonth: number; lastMonth: number };
  newUsers: { thisMonth: number; lastMonth: number };
  orders: { thisMonth: number; lastMonth: number };
  pendingVendors: number;
  userStatusBreakdown: { status: string; total: number }[];
  vendorStatusBreakdown: { status: string; total: number }[];
  transactionStatusBreakdown: { status: string; total: number }[];
}

export interface IGrowthDataPoint {
  label: string;
  period: string;
  users: number;
  vendors: number;
  revenue: number;
  orders: number;
}

/** `GET admin/analytics/revenue` — different shape from growth. */
export interface IRevenueDataPoint {
  month: string;
  revenue: number;
  txCount: number;
}

export type IUserDistribution = { name: string; value: number }[];

export type ITransactionBreakdown = { name: string; count: number; total: number }[];

export interface IRecentSignup {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  account_type: string;
  account_status?: string;
  created_at: string;
}

export interface ITopStore {
  id: string;
  store_name: string;
  slug: string;
  category?: string;
  /** Numeric column serializes as string. */
  total_revenue: string;
  total_orders: number;
  total_products: number;
  rating_average?: string;
  created_at: string;
}

export type IOrderBreakdown = { name: string; count: number; totalAmount: number }[];

export interface ISignupMethod {
  name: string;
  value: number;
}

/** Broadcast entity — fields are `subject`/`body`/`target`. */
export interface IBroadcast {
  id: string;
  subject: string;
  body: string;
  target?: string;
  status?: string;
  scheduled_at?: string;
  sent_at?: string;
  is_recurring?: boolean;
  recurrence_type?: string;
  recurrence_time?: string;
  recurrence_days?: string[];
  recurrence_day_of_month?: string[];
  recipients?: string[];
  failure_reason?: string;
  is_active?: boolean;
  last_executed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IAutomatedNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  created_at: string;
  scheduled_at?: string;
  sent_at?: string;
  is_recurring?: boolean;
  is_active?: boolean;
  recurrence_type?: string;
  recurrence_time?: string;
  recurrence_days?: string[];
  recurrence_day_of_month?: string[];
}

/** Admin order list rows — subset of order fields, store name under `store`. */
export interface IAdminOrder {
  id: string;
  buyer_id?: string;
  vendor_id: string;
  /** Numeric column serializes as string. */
  total: string;
  status: string;
  payment_status: string;
  created_at: string;
  buyer?: { id: string; first_name: string; last_name: string; email?: string };
  vendor?: { id: string; first_name: string; last_name: string; email?: string };
  store?: { id: string; store_name: string };
}

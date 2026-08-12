export interface IAdminUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  avatar?: string;
  account_type: string;
  account_status: string;
  email_verified?: boolean;
  created_at: string;
  stores_count?: number;
}

export interface IAdminVendor {
  id: string;
  store_name: string;
  slug: string;
  logo?: string;
  status: string;
  category?: string;
  total_products?: number;
  total_orders?: number;
  total_revenue?: number;
  created_at?: string;
  user?: { id: string; first_name: string; last_name: string; email: string };
}

export interface IAdminTransaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  reference?: string;
  description?: string;
  status: string;
  is_flagged?: boolean;
  created_at: string;
  user?: { id: string; first_name: string; last_name: string; email: string };
  vendor?: { id: string; store_name: string };
  order_id?: string;
}

export interface IAdminEscrow {
  id: string;
  status: 'pending' | 'funded' | 'delivered' | 'released' | 'disputed' | 'refunded' | 'completed';
  amount: number;
  escrow_fee?: number;
  hold_until?: string;
  created_at?: string;
  order?: { id: string; total: number; created_at: string };
  vendor?: { id: string; store_name: string; logo?: string };
  buyer?: { id: string; first_name: string; last_name: string; email?: string };
}

export interface IAdminPayout {
  id: string;
  amount: number;
  status: string;
  payout_type: string;
  created_at?: string;
  transferred_at?: string;
  vendor?: { id: string; store_name: string; bank_name?: string; account_number?: string };
}

export interface IOverviewStats {
  total_users?: number;
  total_vendors?: number;
  total_orders?: number;
  total_revenue?: number;
  total_products?: number;
  pending_orders?: number;
  pending_payouts?: number;
  escrow_balance?: number;
  new_users_today?: number;
  new_vendors_today?: number;
  orders_today?: number;
}

export interface IGrowthDataPoint {
  month: string;
  users?: number;
  vendors?: number;
  orders?: number;
  revenue?: number;
}

export interface IUserDistribution {
  users: number;
  vendors: number;
  staff: number;
  admins: number;
}

export interface ITransactionBreakdown {
  payments: number;
  escrow_holds: number;
  payouts: number;
  refunds: number;
  fees: number;
  installment_payments: number;
}

export interface IRecentSignup {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  account_type: string;
  created_at: string;
}

export interface ITopStore {
  id: string;
  store_name: string;
  logo?: string;
  total_revenue?: number;
  total_orders?: number;
}

export interface IOrderBreakdown {
  online: number;
  offline: number;
  completed: number;
  pending: number;
  canceled: number;
}

export interface ISignupMethod {
  medium: string;
  count: number;
}

export interface IBroadcast {
  id: string;
  title: string;
  message: string;
  audience?: string;
  status?: string;
  scheduled_at?: string;
  sent_at?: string;
  created_at?: string;
}

export interface IAutomatedNotification {
  id: string;
  name: string;
  message: string;
  enabled?: boolean;
  frequency?: string;
  created_at?: string;
}

export interface ISystemLog {
  id: string;
  level: string;
  context?: string;
  message?: string;
  created_at: string;
}

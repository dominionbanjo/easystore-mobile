export type InstallmentMode = 'auto' | 'manual';
export type InstallmentPlanStatus = 'active' | 'completed' | 'defaulted' | 'canceled' | 'refunding';
export type InstallmentPaymentStatus = 'pending' | 'paid' | 'refunded';

export interface IInstallmentPreset {
  id: string;
  name: string;
  count: number;
  interval_days: number;
}

export interface IInstallmentConfig {
  enabled: boolean;
  presets: IInstallmentPreset[];
  min_order_kobo?: number;
  max_active_plans?: number;
}

export interface IInstallmentPayment {
  id: string;
  index: number;
  amount_kobo: number;
  fee_kobo?: number;
  due_date?: string;
  paid_at?: string;
  payment_reference?: string;
  payment_url?: string;
  status: InstallmentPaymentStatus;
}

export interface IInstallmentPlan {
  id: string;
  order_id: string;
  buyer_id?: string;
  vendor_id?: string;
  store_id?: string;
  store?: { id: string; store_name: string; logo?: string };
  order?: {
    id: string;
    total: number;
    status: string;
    order_items?: {
      product_id: string;
      name: string;
      slug: string;
      image?: string;
      price: number;
      quantity: number;
    }[];
    created_at: string;
  };
  total_kobo: number;
  paid_kobo: number;
  installments_total: number;
  installments_paid: number;
  mode: InstallmentMode;
  preset_id?: string;
  next_due_date?: string;
  status: InstallmentPlanStatus;
  deposit_expires_at?: string;
  defaulted_at?: string;
  canceled_at?: string;
  completed_at?: string;
  payments?: IInstallmentPayment[];
  created_at?: string;
}

export interface ICreateInstallmentPayload {
  order_id: string;
  preset_id: string;
  mode: InstallmentMode;
}

export interface IInstallmentPaymentInitResponse {
  success: boolean;
  payment_url: string | null;
  reference?: string;
}

export interface IVendorInstallment extends IInstallmentPlan {
  buyer?: { id: string; first_name: string; last_name: string; email?: string };
}

export interface IAdminInstallment extends IInstallmentPlan {
  buyer?: { id: string; first_name: string; last_name: string; email?: string };
  vendor?: { id: string; store_name: string };
}

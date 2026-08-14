import type { IPagination } from './api';

export type InstallmentMode = 'auto' | 'manual';
export type InstallmentPlanStatus = 'active' | 'completed' | 'defaulted' | 'canceled' | 'refunding';
export type InstallmentPaymentStatus = 'pending' | 'paid' | 'refunded';

export interface IInstallmentPreset {
  id: string;
  name: string;
  count: number;
  interval_days: number;
}

/** `GET installments/config` — no `enabled` flag is returned. */
export interface IInstallmentConfig {
  presets: IInstallmentPreset[];
  min_order_kobo: number;
  max_concurrent_plans: number;
  default_lockout_days: number;
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

/** Scalar plan view — relations (order/store/payments/buyer/vendor) are NOT mapped. */
export interface IInstallmentPlan {
  id: string;
  order_id: string;
  buyer_id?: string;
  vendor_id?: string;
  store_id?: string;
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
  admin_note?: string;
  created_at?: string;
  updated_at?: string;
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
  payments?: IInstallmentPayment[];
}

/** `GET installments/:id` — double-wrapped `{ success, data: {...plan, payments} }`. */
export interface IInstallmentDetailResponse {
  success: boolean;
  data: IInstallmentPlan & { payments: IInstallmentPayment[] };
}

/** List endpoints — pagination only carries `{ page, limit, total }`. */
export interface IInstallmentListData<T> {
  success: boolean;
  items: T[];
  pagination: Pick<IPagination, 'page' | 'limit' | 'total'>;
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

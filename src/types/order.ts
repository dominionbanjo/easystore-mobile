export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'failed'
  | 'canceled';

export type PaymentStatus =
  | 'pending'
  | 'success'
  | 'failed'
  | 'canceled'
  | 'refunded'
  | 'unpaid'
  | 'partial';

export type PaymentMethod = 'online' | 'offline' | 'cash' | 'transfer' | 'pos' | 'panda';

export interface IOrderItem {
  product_id: string;
  name: string;
  slug: string;
  /** Kobo — raw order_items column (numeric serializes as string). */
  price: string | number;
  discount_price?: string | number | null;
  image?: string | null;
  quantity: number;
  size?: string | null;
  color?: string | null;
  variant_id?: string | null;
  variant_options?: Record<string, string> | null;
}

export interface IDelivery {
  id?: string;
  delivery_status:
    | 'pending'
    | 'assigned'
    | 'in_transit'
    | 'delivered'
    | 'confirmed'
    | 'failed'
    | 'returned';
  tracking_number?: string;
  confirmation_code?: string | null;
  estimated_delivery?: string;
  delivered_at?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  courier_id?: string;
}

export interface IOrder {
  id: string;
  buyer_id?: string;
  vendor_id: string;
  order_items: IOrderItem[];
  /** Numeric columns serialize as strings on buyer lists; numbers on vendor/detail views. */
  subtotal: string | number;
  shipping_fee?: string | number;
  platform_fee?: string | number;
  tax?: string | number;
  total: string | number;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  payment_reference?: string;
  payment_url?: string;
  payment_plan_id?: string;
  escrow_id?: string;
  delivery_id?: string;
  notes?: string;
  delivery_address?: {
    id?: string;
    street: string;
    city: string;
    state: string;
    country?: string;
    postal_code?: string;
  };
  delivery?: IDelivery;
  escrow?: { id?: string; status: string; release_code?: string };
  buyer?: { id: string; first_name: string; last_name: string; email?: string; phone_number?: string; avatar?: string };
  /** Store fields are nested under `vendor.stores[]` — never at `vendor.store_name`. */
  vendor?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    stores?: {
      id: string;
      store_name: string;
      slug: string;
      logo?: string;
      phone_number?: string;
      address_street?: string;
      address_city?: string;
      address_state?: string;
    }[];
  };
  created_at: string;
  updated_at?: string;
  confirmed?: boolean;
}

export interface ICreateOrderItemDto {
  product_id: string;
  variant_id?: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface ICreateOnlineOrderPayload {
  email: string;
  order_items: ICreateOrderItemDto[];
  delivery_rate_id?: string;
  delivery_address_id?: string;
}

export interface ICreateOfflineOrderPayload {
  order_items: ICreateOrderItemDto[];
  tax?: number;
  notes?: string;
  delivery_address_id?: string;
}

export interface IRecordVendorOfflineSalePayload {
  items: { product_id: string; variant_id?: string; quantity: number }[];
  customer_name?: string;
  customer_email?: string;
  notes?: string;
  payment_method?: 'cash' | 'transfer' | 'pos';
}

export interface IOnlineOrderResponse {
  success: boolean;
  order_id: string;
  payment_url: string | null;
  reference?: string;
}

export interface ICheckoutSummaryItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
}

/** Per-store checkout summary group (kobo amounts). */
export interface ICheckoutSummaryGroup {
  store_id: string | null;
  vendor_id: string;
  store_name: string;
  items: {
    product_id: string;
    vendor_id: string;
    store_id: string | null;
    name: string;
    slug: string;
    price: number;
    discount_price: number | null;
    unit_price: number;
    image: string | null;
    quantity: number;
    size: string | null;
    color: string | null;
    variant_id?: string | null;
    variant_options?: Record<string, string> | null;
  }[];
  /** Subtotal in kobo. */
  subtotal: number;
  delivery_options: {
    id: string;
    state: string;
    location?: string | null;
    fee: string;
    duration?: string | null;
    notes?: string | null;
  }[];
  escrow_enabled: boolean;
  installments_enabled: boolean;
}

/** `POST orders/summary` — double-wrapped `{ success, data: groups[] }`. */
export interface ICheckoutSummaryResponse {
  success: boolean;
  data: ICheckoutSummaryGroup[];
}

export interface IOrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface IVendorOrderQueryParams extends IOrderQueryParams {
  dateFrom?: string;
  dateTo?: string;
  staffId?: string;
}

export interface ISalesRecord {
  id: string;
  items: IOrderItem[];
  subtotal: number;
  total: number;
  notes?: string | null;
  recorded_by?: string;
  staff_name: string | null;
  created_at: string;
}

export interface IReceiptData {
  id: string;
  order_reference: string;
  store_name: string;
  store_logo: string | null;
  items: IOrderItem[];
  subtotal: number;
  shipping_fee: number;
  tax: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  staff_name: string | null;
  notes?: string | null;
  created_at: string;
}

export interface IReceiptPdfResponse {
  status: 'success';
  data: string;
  filename: string;
}

export interface IStaffSummary {
  today_sales: number;
  today_orders: number;
  total_products: number;
  low_stock_count: number;
}

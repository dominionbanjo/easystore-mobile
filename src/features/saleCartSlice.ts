import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type SalePaymentMethod = 'cash' | 'transfer' | 'pos';

export interface SaleCartItem {
  key: string;
  product_id: string;
  variant_id?: string;
  name: string;
  slug?: string;
  price: number;
  image?: string;
  quantity: number;
  variant_options?: Record<string, string>;
}

export interface SaleCartState {
  items: SaleCartItem[];
  paymentMethod: SalePaymentMethod;
  customerName?: string;
  customerEmail?: string;
  notes?: string;
}

const initialState: SaleCartState = {
  items: [],
  paymentMethod: 'cash',
};

const saleCartSlice = createSlice({
  name: 'saleCart',
  initialState,
  reducers: {
    addSaleItem(state, action: PayloadAction<Omit<SaleCartItem, 'key'>>) {
      const key = `${action.payload.product_id}|${action.payload.variant_id ?? ''}`;
      const existing = state.items.find((item) => item.key === key);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push({ ...action.payload, key });
      }
    },
    updateSaleQuantity(
      state,
      action: PayloadAction<{ key: string; quantity: number }>,
    ) {
      const item = state.items.find((i) => i.key === action.payload.key);
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
    },
    removeSaleItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.key !== action.payload);
    },
    setSalePaymentMethod(state, action: PayloadAction<SalePaymentMethod>) {
      state.paymentMethod = action.payload;
    },
    setSaleCustomer(state, action: PayloadAction<{ name?: string; email?: string }>) {
      state.customerName = action.payload.name;
      state.customerEmail = action.payload.email;
    },
    setSaleNotes(state, action: PayloadAction<string>) {
      state.notes = action.payload;
    },
    clearSaleCart(state) {
      state.items = [];
      state.paymentMethod = 'cash';
      state.customerName = undefined;
      state.customerEmail = undefined;
      state.notes = undefined;
    },
  },
});

export const {
  addSaleItem,
  updateSaleQuantity,
  removeSaleItem,
  setSalePaymentMethod,
  setSaleCustomer,
  setSaleNotes,
  clearSaleCart,
} = saleCartSlice.actions;

export function selectSaleCart(state: { saleCart: SaleCartState }) {
  const total = state.saleCart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return {
    items: state.saleCart.items,
    paymentMethod: state.saleCart.paymentMethod,
    customerName: state.saleCart.customerName,
    customerEmail: state.saleCart.customerEmail,
    notes: state.saleCart.notes,
    total,
    count: state.saleCart.items.length,
  };
}

export default saleCartSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ICartItem } from '@/types/cart';

export interface CartState {
  guestItems: ICartItem[];
}

const initialState: CartState = {
  guestItems: [],
};

function computeTotals(items: ICartItem[]): {
  subtotal: number;
  total: number;
} {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.discount_price ?? item.price) * item.quantity,
    0,
  );
  return { subtotal, total: subtotal };
}

function itemKey(item: Pick<ICartItem, 'product_id' | 'variant_id' | 'size' | 'color'>): string {
  return `${item.product_id}|${item.variant_id ?? ''}|${item.size ?? ''}|${item.color ?? ''}`;
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addGuestItem(state, action: PayloadAction<ICartItem>) {
      const existing = state.guestItems.find(
        (item) => itemKey(item) === itemKey(action.payload),
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.guestItems.push(action.payload);
      }
    },
    updateGuestQuantity(
      state,
      action: PayloadAction<{ key: string; quantity: number }>,
    ) {
      const item = state.guestItems.find((i) => itemKey(i) === action.payload.key);
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
    },
    removeGuestItem(state, action: PayloadAction<string>) {
      state.guestItems = state.guestItems.filter(
        (item) => itemKey(item) !== action.payload,
      );
    },
    clearGuestCart(state) {
      state.guestItems = [];
    },
    replaceGuestItems(state, action: PayloadAction<ICartItem[]>) {
      state.guestItems = action.payload;
    },
  },
});

export const {
  addGuestItem,
  updateGuestQuantity,
  removeGuestItem,
  clearGuestCart,
  replaceGuestItems,
} = cartSlice.actions;

export function selectGuestCart(state: { cart: CartState }) {
  const totals = computeTotals(state.cart.guestItems);
  return {
    items: state.cart.guestItems,
    ...totals,
  };
}

export default cartSlice.reducer;

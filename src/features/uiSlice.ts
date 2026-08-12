import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface UiState {
  toasts: ToastMessage[];
  loadingOverlay: boolean;
  switchStoreModalOpen: boolean;
}

const initialState: UiState = {
  toasts: [],
  loadingOverlay: false,
  switchStoreModalOpen: false,
};

let toastCounter = 0;

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast(state, action: PayloadAction<Omit<ToastMessage, 'id'>>) {
      toastCounter += 1;
      state.toasts.push({ ...action.payload, id: `toast-${toastCounter}` });
      if (state.toasts.length > 3) {
        state.toasts.shift();
      }
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    clearToasts(state) {
      state.toasts = [];
    },
    setLoadingOverlay(state, action: PayloadAction<boolean>) {
      state.loadingOverlay = action.payload;
    },
    setSwitchStoreModalOpen(state, action: PayloadAction<boolean>) {
      state.switchStoreModalOpen = action.payload;
    },
  },
});

export const {
  addToast,
  removeToast,
  clearToasts,
  setLoadingOverlay,
  setSwitchStoreModalOpen,
} = uiSlice.actions;

export default uiSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { IUser } from '@/types/auth';

export interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  initialRouteSet: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrated: false,
  initialRouteSet: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: IUser; access: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.access;
      state.isAuthenticated = true;
    },
    setUser(state, action: PayloadAction<IUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      state.isAuthenticated = Boolean(state.user);
    },
    clearCredentials(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
    setHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },
    setInitialRouteSet(state, action: PayloadAction<boolean>) {
      state.initialRouteSet = action.payload;
    },
  },
});

export const {
  setCredentials,
  setUser,
  setAccessToken,
  clearCredentials,
  setHydrated,
  setInitialRouteSet,
} = authSlice.actions;

export default authSlice.reducer;

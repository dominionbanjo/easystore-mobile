export type AccountType = 'user' | 'vendor' | 'admin' | 'staff';
export type AccountStatus = 'active' | 'pending' | 'restricted' | 'banned';

export interface IUserAddress {
  id?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  is_default?: boolean;
}

export interface IUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  username?: string;
  account_type: AccountType;
  account_status: AccountStatus;
  avatar?: string;
  email_verified: boolean;
  payout_verified?: boolean;
  rating_average?: string;
  rating_count?: number;
  review_count?: number;
  address?: IUserAddress;
  addresses?: IUserAddress[];
  must_change_password?: boolean;
  active_store_id?: string;
  bank_code?: string;
  account_number?: string;
  bank_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface IAuthData {
  user: IUser;
  access: string;
}

export interface IAuthResponse extends IApiAuthEnvelope {
  data: IAuthData;
}

export interface IApiAuthEnvelope {
  status: string;
  message: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number?: string;
  account_type: 'user' | 'vendor';
  store_name?: string;
  description?: string;
  current_sales_channel?: string;
  agree_to_terms: boolean;
}

export interface IVerifyOtpPayload {
  email: string;
  otp: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  token: string;
  email: string;
  password: string;
}

export interface ISwitchStorePayload {
  store_id: string;
}

export interface ISwitchStoreResponse {
  success: boolean;
  access_token: string;
}

export interface IBank {
  name: string;
  code: string;
}

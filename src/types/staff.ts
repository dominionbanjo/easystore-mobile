import type { PermissionCode } from '@/constants/permissions';

export interface IStaffUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  account_status?: string;
  phone_number?: string;
}

export interface IStaffMember {
  id: string;
  status: 'active' | 'suspended' | 'invited';
  permissions?: PermissionCode[];
  last_login_at?: string;
  created_at?: string;
  user: IStaffUser;
}

export interface IInviteStaffPayload {
  email: string;
  permissions: PermissionCode[];
}

export interface IStaffProfile {
  id: string;
  user: IStaffUser;
  status: string;
  permissions?: PermissionCode[];
  last_login_at?: string;
}

export interface IChangePasswordPayload {
  current_password: string;
  new_password: string;
}

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

/** Backend invite accepts these fields only — `permissions` is ignored. */
export interface IInviteStaffPayload {
  email: string;
  first_name?: string;
  last_name?: string;
  password?: string;
}

/** `GET staff/me` — returns the flat user, not a nested profile. */
export interface IStaffProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  avatar?: string;
  created_at?: string;
}

/** `GET staff/permissions` — wrapped `{ permissions }` object, not an array. */
export interface IStaffPermissionsResponse {
  permissions: PermissionCode[];
}

export interface IChangePasswordPayload {
  current_password: string;
  new_password: string;
}

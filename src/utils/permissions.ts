import type { AccountType } from '@/types/auth';

export function hasPermission(
  permissions: string[] | null | undefined,
  required: string,
): boolean {
  if (!permissions) {
    return false;
  }
  return permissions.includes(required);
}

export function roleHome(accountType: AccountType | string | undefined): string {
  switch (accountType) {
    case 'vendor':
      return '/vendor';
    case 'staff':
      return '/staff';
    case 'admin':
      return '/admin';
    default:
      return '/home';
  }
}

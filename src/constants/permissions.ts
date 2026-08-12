export const PERMISSIONS = {
  productCreate: 'product:create',
  productUpdate: 'product:update',
  productDelete: 'product:delete',
  productView: 'product:view',
  categoryManage: 'category:manage',
  orderView: 'order:view',
  orderManage: 'order:manage',
  orderCancel: 'order:cancel',
  storeManage: 'store:manage',
  analyticsView: 'analytics:view',
  zoneManage: 'zone:manage',
  userView: 'user:view',
  userManage: 'user:manage',
  transactionView: 'transaction:view',
  payoutManage: 'payout:manage',
  installmentView: 'installment:view',
  installmentManage: 'installment:manage',
  systemSettings: 'system:settings',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<string, PermissionCode[]> = {
  admin: Object.values(PERMISSIONS),
  vendor: [
    PERMISSIONS.productCreate,
    PERMISSIONS.productUpdate,
    PERMISSIONS.productDelete,
    PERMISSIONS.productView,
    PERMISSIONS.orderView,
    PERMISSIONS.orderManage,
    PERMISSIONS.storeManage,
    PERMISSIONS.analyticsView,
    PERMISSIONS.transactionView,
    PERMISSIONS.installmentView,
    PERMISSIONS.installmentManage,
    PERMISSIONS.zoneManage,
  ],
  staff: [
    PERMISSIONS.productView,
    PERMISSIONS.orderView,
    PERMISSIONS.orderManage,
    PERMISSIONS.installmentView,
  ],
  user: [PERMISSIONS.productView, PERMISSIONS.orderView, PERMISSIONS.orderCancel],
};

export const ALL_PERMISSION_CODES: PermissionCode[] = Object.values(PERMISSIONS);

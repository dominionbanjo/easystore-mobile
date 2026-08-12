import { Badge } from '../ui/Card';

const STATUS_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
  active: 'success',
  completed: 'success',
  delivered: 'success',
  success: 'success',
  paid: 'success',
  released: 'success',
  confirmed: 'success',
  pending: 'warning',
  processing: 'info',
  in_transit: 'info',
  assigned: 'info',
  funded: 'info',
  invited: 'info',
  restricted: 'warning',
  failed: 'danger',
  canceled: 'danger',
  cancelled: 'danger',
  suspended: 'danger',
  banned: 'danger',
  rejected: 'danger',
  defaulted: 'danger',
  refunded: 'muted',
  draft: 'muted',
  inactive: 'muted',
  disputed: 'warning',
  pending_manual: 'warning',
  paused: 'warning',
  reversed: 'danger',
  unpaid: 'warning',
  partial: 'info',
};

export function StatusBadge({ status }: { status?: string }) {
  if (!status) {
    return null;
  }
  const variant = STATUS_VARIANTS[status.toLowerCase()] ?? 'default';
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  return <Badge label={label} variant={variant} />;
}

export function OrderStatusBadge({ status }: { status?: string }) {
  return <StatusBadge status={status} />;
}

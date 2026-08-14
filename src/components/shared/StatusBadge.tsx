import { Badge } from '../ui/Card';
import type { BadgeVariant } from '../ui/Card';

const STATUS_LABELS: Record<string, string> = {
  pending_manual: 'In Review',
  success: 'Paid',
  in_transit: 'Shipped',
  shipped: 'Shipped',
  assigned: 'Assigned',
  failed: 'Failed',
  returned: 'Returned',
  canceled: 'Canceled',
  cancelled: 'Canceled',
  flagged: 'Flagged',
  refunding: 'Refunding',
  reversed: 'Reversed',
};

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  active: 'success',
  completed: 'success',
  delivered: 'success',
  shipped: 'info',
  returned: 'success',
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
  failed: 'destructive',
  canceled: 'destructive',
  cancelled: 'destructive',
  suspended: 'destructive',
  banned: 'destructive',
  rejected: 'destructive',
  defaulted: 'destructive',
  refunded: 'muted',
  refunding: 'warning',
  draft: 'muted',
  inactive: 'muted',
  disputed: 'warning',
  pending_manual: 'warning',
  paused: 'warning',
  reversed: 'destructive',
  unpaid: 'warning',
  partial: 'info',
  flagged: 'destructive',
  on_sale: 'success',
};

export function StatusBadge({ status }: { status?: string }) {
  if (!status) {
    return null;
  }
  const key = status.toLowerCase();
  const variant = STATUS_VARIANTS[key] ?? 'default';
  const label =
    STATUS_LABELS[key] ??
    status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  return <Badge label={label} variant={variant} />;
}

export function OrderStatusBadge({ status }: { status?: string }) {
  return <StatusBadge status={status} />;
}

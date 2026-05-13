const STATUS_MAP: Record<string, string> = {
  paid: 'sf-badge--success',
  closed: 'sf-badge--success',
  C: 'sf-badge--success',
  success: 'sf-badge--success',
  open: 'sf-badge--warning',
  outstanding: 'sf-badge--warning',
  O: 'sf-badge--warning',
  pending: 'sf-badge--warning',
  overdue: 'sf-badge--danger',
  cancelled: 'sf-badge--danger',
  failed: 'sf-badge--danger',
  P: 'sf-badge--green',
  scheduled: 'sf-badge--purple',
  // Scheduled order statuses
  ordered: 'sf-badge--warning',
  orderedandpaid: 'sf-badge--success',
  invoiced: 'sf-badge--info',
  invoicedandpaid: 'sf-badge--success',
  // Payment statuses
  partial: 'sf-badge--warning',
  none: 'sf-badge--muted',
};

const LABEL_MAP: Record<string, string> = {
  O: 'Open',
  C: 'Closed',
  P: 'Paid',
};

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const key = (status || '').toLowerCase();
  const className = STATUS_MAP[status] || STATUS_MAP[key] || 'sf-badge--muted';
  const displayLabel = label || LABEL_MAP[status] || status || 'Unknown';

  return <span className={`sf-badge ${className}`}>{displayLabel}</span>;
}

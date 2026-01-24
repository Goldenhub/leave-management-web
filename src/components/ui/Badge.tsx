import { LeaveStatus } from '../../types';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-neutral-100 text-neutral-700',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  danger: 'bg-danger-100 text-danger-700',
  neutral: 'bg-neutral-100 text-neutral-600',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
};

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
}

// Status Badge for Leave Status
interface StatusBadgeProps {
  status: LeaveStatus;
  size?: BadgeSize;
}

const statusConfig: Record<LeaveStatus, { variant: BadgeVariant; label: string }> = {
  [LeaveStatus.Pending]: { variant: 'warning', label: 'Pending' },
  [LeaveStatus.Approved]: { variant: 'success', label: 'Approved' },
  [LeaveStatus.Rejected]: { variant: 'danger', label: 'Rejected' },
  [LeaveStatus.Canceled]: { variant: 'neutral', label: 'Canceled' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: 'neutral' as BadgeVariant, label: status };
  return <Badge variant={config.variant} size={size}>{config.label}</Badge>;
}

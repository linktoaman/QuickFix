import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import type { BookingStatus } from '../../types/booking';

type StatusBadgeTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

type StatusBadgeProps = ComponentPropsWithoutRef<'span'> & {
  children?: ReactNode;
  status?: BookingStatus;
  tone?: StatusBadgeTone;
};

const statusToneMap: Record<BookingStatus, StatusBadgeTone> = {
  Pending: 'warning',
  Confirmed: 'info',
  Completed: 'success',
  Cancelled: 'error',
};

function StatusBadge({
  children,
  className,
  status,
  tone = 'neutral',
  ...badgeProps
}: StatusBadgeProps) {
  const badgeTone = status === undefined ? tone : statusToneMap[status];
  const label = children ?? status;
  const classes = [
    'qf-status-badge',
    `qf-status-badge--${badgeTone}`,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...badgeProps}>
      <span className="qf-status-badge__dot" aria-hidden="true" />
      {label}
    </span>
  );
}

export type { StatusBadgeProps, StatusBadgeTone };
export default StatusBadge;

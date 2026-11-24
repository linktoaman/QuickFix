import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type StatusBadgeTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

type StatusBadgeProps = ComponentPropsWithoutRef<'span'> & {
  children: ReactNode;
  tone?: StatusBadgeTone;
};

function StatusBadge({
  children,
  className,
  tone = 'neutral',
  ...badgeProps
}: StatusBadgeProps) {
  const classes = ['qf-status-badge', `qf-status-badge--${tone}`, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...badgeProps}>
      <span className="qf-status-badge__dot" aria-hidden="true" />
      {children}
    </span>
  );
}

export type { StatusBadgeProps, StatusBadgeTone };
export default StatusBadge;

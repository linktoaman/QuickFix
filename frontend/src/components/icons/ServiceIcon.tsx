import type { ComponentPropsWithoutRef } from 'react';

import type { ServiceIconKey } from '../../types/service';

type ServiceIconProps = ComponentPropsWithoutRef<'svg'> & {
  iconKey: ServiceIconKey;
};

function getIconPath(iconKey: ServiceIconKey) {
  switch (iconKey) {
    case 'wrench':
      return (
        <>
          <path d="M19.1 4.9a5.2 5.2 0 0 1-6.6 6.6l-6.3 6.3a1.9 1.9 0 0 1-2.7-2.7l6.3-6.3a5.2 5.2 0 0 1 6.6-6.6l-3.1 3.1 2.7 2.7 3.1-3.1Z" />
          <path d="m5 16 2 2" />
        </>
      );
    case 'bolt':
      return <path d="m13 2-8 11h6l-1 9 8-12h-6l1-8Z" />;
    case 'snowflake':
      return (
        <>
          <path d="M12 2v20" />
          <path d="m4.9 4.9 14.2 14.2" />
          <path d="M2 12h20" />
          <path d="M4.9 19.1 19.1 4.9" />
          <path d="m8 2 4 4 4-4" />
          <path d="m8 22 4-4 4 4" />
        </>
      );
    case 'sparkles':
      return (
        <>
          <path d="m12 3 1.8 5.1L19 10l-5.2 1.9L12 17l-1.8-5.1L5 10l5.2-1.9L12 3Z" />
          <path d="m5 16 .8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8L5 16Z" />
          <path d="m19 2 .8 2.2L22 5l-2.2.8L19 8l-.8-2.2L16 5l2.2-.8L19 2Z" />
        </>
      );
  }
}

function ServiceIcon({ iconKey, className, ...svgProps }: ServiceIconProps) {
  const classes = ['qf-service-icon', className ?? ''].filter(Boolean).join(' ');

  return (
    <svg
      aria-hidden="true"
      className={classes}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...svgProps}
    >
      {getIconPath(iconKey)}
    </svg>
  );
}

export type { ServiceIconProps };
export default ServiceIcon;

import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type CardProps = ComponentPropsWithoutRef<'section'> & {
  children: ReactNode;
  elevated?: boolean;
};

function Card({ children, className, elevated = false, ...sectionProps }: CardProps) {
  const classes = ['qf-card', elevated ? 'qf-card--elevated' : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes} {...sectionProps}>
      {children}
    </section>
  );
}

export type { CardProps };
export default Card;

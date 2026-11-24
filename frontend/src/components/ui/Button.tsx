import type { ComponentPropsWithoutRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';

type StandardButtonProps = ComponentPropsWithoutRef<'button'> & {
  block?: boolean;
  variant?: Exclude<ButtonVariant, 'icon'>;
};

type IconButtonProps = ComponentPropsWithoutRef<'button'> & {
  'aria-label': string;
  block?: false;
  variant: 'icon';
};

type ButtonProps = IconButtonProps | StandardButtonProps;

function Button({
  block = false,
  className,
  type = 'button',
  variant = 'primary',
  ...buttonProps
}: ButtonProps) {
  const classes = [
    'qf-button',
    `qf-button--${variant}`,
    block ? 'qf-button--block' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return <button className={classes} type={type} {...buttonProps} />;
}

export type { ButtonProps, ButtonVariant };
export default Button;

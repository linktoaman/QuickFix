import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type MessageTone = 'success' | 'warning' | 'error' | 'info';

type MessageProps = ComponentPropsWithoutRef<'div'> & {
  children: ReactNode;
  title?: string;
  tone?: MessageTone;
};

function Message({
  children,
  className,
  role,
  title,
  tone = 'info',
  ...messageProps
}: MessageProps) {
  const classes = ['qf-message', `qf-message--${tone}`, className ?? '']
    .filter(Boolean)
    .join(' ');
  const messageRole = role ?? (tone === 'error' ? 'alert' : 'status');

  return (
    <div className={classes} role={messageRole} {...messageProps}>
      {title === undefined ? null : <p className="qf-message__title">{title}</p>}
      <div className="qf-message__content">{children}</div>
    </div>
  );
}

export type { MessageProps, MessageTone };
export default Message;

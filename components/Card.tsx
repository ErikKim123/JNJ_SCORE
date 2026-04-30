// Design Ref: §7.2 /enter — judge card, 1.5px border, 30px pill radius, hover bg grey-200.

'use client';

import * as React from 'react';

type CardProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

export function Card({
  selected = false,
  className,
  style,
  children,
  ...rest
}: CardProps): React.ReactElement {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const baseStyle: React.CSSProperties = {
    appearance: 'none',
    width: '100%',
    minHeight: 64,
    padding: 'var(--jnj-space-4) var(--jnj-space-5)',
    borderRadius: 'var(--jnj-radius-pill)',
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderColor: 'var(--jnj-grey-300)',
    background: 'var(--jnj-white)',
    color: 'var(--jnj-text-primary)',
    fontFamily: 'var(--jnj-font-text-medium)',
    fontSize: 'var(--jnj-size-body)',
    fontWeight: 'var(--jnj-weight-medium)' as React.CSSProperties['fontWeight'],
    cursor: 'pointer',
    transition: 'var(--jnj-transition)',
    textAlign: 'center',
  };

  if (selected) {
    baseStyle.borderColor = 'var(--jnj-border-active)';
    baseStyle.background = 'var(--jnj-black)';
    baseStyle.color = 'var(--jnj-white)';
  } else if (pressed) {
    baseStyle.background = 'var(--jnj-grey-200)';
    baseStyle.borderColor = 'var(--jnj-grey-500)';
  } else if (hover) {
    baseStyle.background = 'var(--jnj-grey-200)';
    baseStyle.borderColor = 'var(--jnj-grey-500)';
  }

  return (
    <button
      type="button"
      className={['jnj-no-select', className ?? ''].filter(Boolean).join(' ')}
      style={{ ...baseStyle, ...style }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      {...rest}
    >
      {children}
    </button>
  );
}

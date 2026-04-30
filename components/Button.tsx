// Design Ref: §7 — pill button (30px radius), primary/secondary/inverse variants.
// Mirrors `.jnj-btn*` classes from colors_and_type.css for consistency.

import * as React from 'react';

type Variant = 'primary' | 'secondary' | 'inverse';
type Size = 'md' | 'sm';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
};

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'jnj-btn jnj-btn-primary',
  secondary: 'jnj-btn jnj-btn-secondary',
  inverse: 'jnj-btn jnj-btn-inverse',
};

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
  style,
  ...rest
}: ButtonProps): React.ReactElement {
  const classes = [
    VARIANT_CLASS[variant],
    size === 'sm' ? 'jnj-btn-sm' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const merged: React.CSSProperties = {
    ...(block ? { width: '100%' } : null),
    ...style,
  };

  return <button className={classes} style={merged} {...rest} />;
}

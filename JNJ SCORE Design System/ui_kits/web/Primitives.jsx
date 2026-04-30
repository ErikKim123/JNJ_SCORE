const { useState } = React;

function Button({ variant = 'primary', size, children, onClick, disabled, type = 'button' }) {
  const cls = ['jnj-btn', `jnj-btn-${variant}`, size === 'sm' ? 'jnj-btn-sm' : ''].filter(Boolean).join(' ');
  return <button type={type} className={cls} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Badge({ variant = 'new', children }) {
  const styles = {
    sale:    { background: '#D30005', color: '#fff' },
    live:    { background: '#FF5000', color: '#fff' },
    new:     { background: '#111111', color: '#fff' },
    soldout: { background: '#E5E5E5', color: '#9E9EA0' },
    member:  { background: 'transparent', color: '#111111', border: '1.5px solid #111111' },
  };
  return (
    <span style={{
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: 12, fontWeight: 500, padding: '4px 10px',
      borderRadius: 30, textTransform: 'uppercase', letterSpacing: '0.5px',
      display: 'inline-flex', alignItems: 'center', gap: 6,
      ...styles[variant],
    }}>
      {variant === 'live' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
      {children}
    </span>
  );
}

function Icon({ name, size = 24, color = 'currentColor' }) {
  const stroke = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
    heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
    bag: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    menu: <><path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" /></>,
    close: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
    arrowRight: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  };
  return <svg {...stroke}>{paths[name]}</svg>;
}

Object.assign(window, { Button, Badge, Icon });

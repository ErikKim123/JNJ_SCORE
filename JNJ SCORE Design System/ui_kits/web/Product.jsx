function ProductCard({ image, title, meta, price, badge, onClick }) {
  return (
    <a href="#" onClick={(e) => { e.preventDefault(); onClick && onClick(); }} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#F5F5F5', overflow: 'hidden' }}>
        <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {badge && <div style={{ position: 'absolute', top: 12, left: 12 }}><Badge variant={badge.variant}>{badge.text}</Badge></div>}
      </div>
      <div>
        <p style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 16, fontWeight: 500, color: '#111', margin: 0 }}>{title}</p>
        <p style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 14, color: '#707072', margin: 0, marginTop: 2 }}>{meta}</p>
        <p style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 16, fontWeight: 500, color: '#111', margin: 0, marginTop: 8 }}>${price}</p>
      </div>
    </a>
  );
}

function FilterBar({ filters, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '24px 48px', flexWrap: 'wrap', maxWidth: 1440, margin: '0 auto' }}>
      {filters.map((f) => {
        const isActive = active === f;
        return (
          <button key={f} onClick={() => onChange(f)} style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: 14, fontWeight: 500,
            padding: '10px 16px', borderRadius: 30,
            border: '1.5px solid ' + (isActive ? '#111' : '#CACACB'),
            background: isActive ? '#111' : '#fff',
            color: isActive ? '#fff' : '#111',
            cursor: 'pointer', transition: 'all 200ms ease',
          }}>{f}</button>
        );
      })}
    </div>
  );
}

function ProductGrid({ products, onSelect }) {
  return (
    <section style={{ padding: '0 48px 64px', maxWidth: 1440, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {products.map((p) => (
          <ProductCard key={p.id} {...p} onClick={() => onSelect && onSelect(p)} />
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ kicker, title, ctaLabel, onCta }) {
  return (
    <div style={{ padding: '64px 48px 24px', maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div>
        {kicker && <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '2px', color: '#707072', marginBottom: 8 }}>{kicker}</div>}
        <h2 style={{ fontFamily: 'Oswald, Arial', fontSize: 48, fontWeight: 500, lineHeight: 0.9, textTransform: 'uppercase', color: '#111', margin: 0, letterSpacing: '-0.5px' }}>{title}</h2>
      </div>
      {ctaLabel && <Button variant="secondary" size="sm" onClick={onCta}>{ctaLabel}</Button>}
    </div>
  );
}

Object.assign(window, { ProductCard, FilterBar, ProductGrid, SectionHeader });

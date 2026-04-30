function ProductDetail({ product, onBack, onAdd, added }) {
  const sizes = ['7', '8', '9', '10', '11', '12'];
  const [size, setSize] = React.useState(null);
  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '24px 48px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 14, fontWeight: 500, color: '#111', marginBottom: 16 }}>&larr; Back</button>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 48 }}>
        <div style={{ background: '#F5F5F5' }}>
          <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        <div>
          <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '2px', color: '#D33918', marginBottom: 8 }}>Just dropped</div>
          <h1 style={{ fontFamily: 'Oswald, Arial', fontSize: 48, fontWeight: 500, lineHeight: 0.9, textTransform: 'uppercase', color: '#111', margin: 0, letterSpacing: '-0.5px' }}>{product.title}</h1>
          <p style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 16, color: '#707072', margin: '8px 0 0' }}>{product.meta}</p>
          <p style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 20, fontWeight: 500, color: '#111', margin: '16px 0 32px' }}>${product.price}</p>

          <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Select size</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 32 }}>
            {sizes.map((s) => (
              <button key={s} onClick={() => setSize(s)} style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontSize: 14, fontWeight: 500, padding: '14px',
                border: '1px solid ' + (size === s ? '#111' : '#CACACB'),
                background: '#fff', color: '#111', cursor: 'pointer', borderRadius: 8,
              }}>{s}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Button variant="primary" onClick={() => onAdd(size)} disabled={!size}>{added ? 'Added to bag' : (size ? 'Add to bag' : 'Pick a size')}</Button>
            <Button variant="secondary">Favorite</Button>
          </div>

          <p style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 14, color: '#707072', marginTop: 24, lineHeight: 1.75 }}>
            Carbon plate. Game day. The {product.title} is built for the moments where milliseconds count — sprinting onto the wing, cutting back inside the box, finishing top corner.
          </p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProductDetail });

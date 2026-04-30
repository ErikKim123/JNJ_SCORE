function Nav({ active = 'New', onNav }) {
  const links = ['New', 'Men', 'Women', 'Kids', 'Sale'];
  return (
    <div>
      <div style={{ background: '#111', color: '#fff', textAlign: 'center', padding: '8px 16px', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 12, fontWeight: 500 }}>
        JNJ Members: Free shipping. No minimum. <a href="#" style={{ color: '#fff', marginLeft: 8 }}>Join us</a>
      </div>
      <nav style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', borderBottom: '1px solid #F5F5F5' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); onNav && onNav('home'); }}>
          <img src="../../assets/logo.svg" alt="JNJ SCORE" style={{ height: 24 }} />
        </a>
        <div style={{ display: 'flex', gap: 28 }}>
          {links.map((l) => (
            <a key={l} href="#" onClick={(e) => { e.preventDefault(); onNav && onNav(l === 'New' ? 'home' : 'shop'); }} style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: 16, fontWeight: 500, color: '#111', textDecoration: 'none',
              borderBottom: active === l ? '2px solid #111' : '2px solid transparent',
              paddingBottom: 18, paddingTop: 18,
            }}>{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ background: '#F5F5F5', borderRadius: 24, padding: '8px 16px', width: 160, display: 'flex', alignItems: 'center', gap: 8, color: '#707072', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 14 }}>
            <Icon name="search" size={18} />Search
          </div>
          <button style={{ background: '#F5F5F5', border: 'none', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="heart" size={20} /></button>
          <button style={{ background: '#F5F5F5', border: 'none', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="bag" size={20} /></button>
        </div>
      </nav>
    </div>
  );
}

function Footer() {
  const cols = [
    { title: 'Shop', links: ['New releases', 'Men', 'Women', 'Kids', 'Sale'] },
    { title: 'Help', links: ['Order status', 'Shipping', 'Returns', 'Contact us'] },
    { title: 'Company', links: ['About JNJ', 'Careers', 'Investors', 'Sustainability'] },
  ];
  return (
    <footer style={{ background: '#111', color: '#fff', padding: '64px 48px 32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 48, maxWidth: 1440, margin: '0 auto' }}>
        <div>
          <div style={{ fontFamily: 'Oswald, Arial', fontSize: 32, fontWeight: 500, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 16 }}>JNJ<br/>SCORE</div>
          <p style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 13, color: '#9E9EA0', lineHeight: 1.6 }}>Track every rep. Watch every game. Suit up.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>{c.title}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {c.links.map((l) => (
                <li key={l}><a href="#" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 14, color: '#9E9EA0', textDecoration: 'none' }}>{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #28282A', marginTop: 48, paddingTop: 24, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 12, color: '#707072', display: 'flex', justifyContent: 'space-between' }}>
        <span>© 2026 JNJ SCORE, Inc.</span>
        <span>Terms · Privacy · Cookie settings</span>
      </div>
    </footer>
  );
}

Object.assign(window, { Nav, Footer });

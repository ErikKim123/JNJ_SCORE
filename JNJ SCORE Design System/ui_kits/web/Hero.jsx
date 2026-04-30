function Hero({ onCta }) {
  return (
    <section style={{ position: 'relative', width: '100%', height: 640, overflow: 'hidden', background: '#111' }}>
      <img src="../../assets/hero-stadium.svg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(17,17,17,0.1) 0%, rgba(17,17,17,0.6) 100%)' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '64px 48px', maxWidth: 1440, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '2px', color: '#fff', marginBottom: 16 }}>Just dropped</div>
        <h1 style={{ fontFamily: 'Oswald, Arial', fontSize: 96, fontWeight: 500, lineHeight: 0.9, textTransform: 'uppercase', color: '#fff', margin: 0, letterSpacing: '-1px' }}>Don't stop.<br/>Never settle.</h1>
        <p style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 16, fontWeight: 400, lineHeight: 1.75, color: '#fff', maxWidth: 480, marginTop: 24 }}>Track every workout, every game, every rep. JNJ SCORE keeps the receipts.</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <Button variant="inverse" onClick={onCta}>Shop now</Button>
          <Button variant="primary" onClick={onCta} >Watch the film</Button>
        </div>
      </div>
    </section>
  );
}

function Scoreboard({ matches = [] }) {
  return (
    <section style={{ background: '#111', color: '#fff', padding: '24px 48px' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
        <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '2px' }}>Live now</div>
        <div style={{ display: 'flex', gap: 32, flex: 1, justifyContent: 'center' }}>
          {matches.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 32, height: 32, background: '#28282A', borderRadius: '50%' }}></div>
                <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: '1px' }}>{m.home}</div>
              </div>
              <div style={{ fontFamily: 'Oswald, Arial', fontSize: 36, fontWeight: 500, lineHeight: 1 }}>{m.hs}</div>
              <Badge variant="live">{m.min}'</Badge>
              <div style={{ fontFamily: 'Oswald, Arial', fontSize: 36, fontWeight: 500, lineHeight: 1 }}>{m.as}</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 32, height: 32, background: '#28282A', borderRadius: '50%' }}></div>
                <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: '1px' }}>{m.away}</div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="inverse" size="sm">All scores</Button>
      </div>
    </section>
  );
}

Object.assign(window, { Hero, Scoreboard });

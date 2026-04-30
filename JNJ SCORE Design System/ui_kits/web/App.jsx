const PRODUCTS = [
  { id: 1, image: '../../assets/product-cleat.svg',   title: 'Velocity Cleat 7',   meta: "Men's Soccer · Firm Ground", price: 185, badge: { variant: 'new', text: 'New' } },
  { id: 2, image: '../../assets/product-runner.svg',  title: 'Pace Runner Pro',    meta: 'Road Running',                price: 160 },
  { id: 3, image: '../../assets/product-trainer.svg', title: 'Crosstrain 02',      meta: 'Training · All Day',          price: 130 },
  { id: 4, image: '../../assets/product-cleat.svg',   title: 'Velocity Cleat 7 Elite', meta: "Men's Soccer · Carbon",  price: 285, badge: { variant: 'sale', text: 'Sale' } },
  { id: 5, image: '../../assets/product-runner.svg',  title: 'Pace Runner Lite',   meta: 'Road Running · Lightweight',  price: 130 },
  { id: 6, image: '../../assets/product-trainer.svg', title: 'Crosstrain 02 Mid',  meta: 'Training · Ankle Support',    price: 145 },
];

const MATCHES = [
  { home: 'ARS', away: 'CHE', hs: 2, as: 1, min: 67 },
  { home: 'LAL', away: 'BOS', hs: 88, as: 91, min: 'Q4' },
];

function App() {
  const [page, setPage] = React.useState('home');
  const [activeFilter, setActiveFilter] = React.useState('All');
  const [selected, setSelected] = React.useState(null);
  const [added, setAdded] = React.useState(false);

  const goTo = (p) => { setPage(p); setAdded(false); window.scrollTo(0, 0); };

  return (
    <div>
      <Nav active={page === 'home' ? 'New' : 'Men'} onNav={goTo} />
      {page === 'home' && (
        <>
          <Hero onCta={() => goTo('shop')} />
          <Scoreboard matches={MATCHES} />
          <SectionHeader kicker="Just in" title="Game day gear" ctaLabel="Shop all" onCta={() => goTo('shop')} />
          <ProductGrid products={PRODUCTS.slice(0, 3)} onSelect={(p) => { setSelected(p); goTo('product'); }} />
        </>
      )}
      {page === 'shop' && (
        <>
          <SectionHeader kicker="All gear" title="Shop the drop" />
          <FilterBar filters={['All', "Men's", "Women's", 'Soccer', 'Running', 'Training', 'Sale']} active={activeFilter} onChange={setActiveFilter} />
          <ProductGrid products={PRODUCTS} onSelect={(p) => { setSelected(p); goTo('product'); }} />
        </>
      )}
      {page === 'product' && selected && (
        <ProductDetail product={selected} onBack={() => goTo('shop')} added={added} onAdd={(size) => { if (size) setAdded(true); }} />
      )}
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

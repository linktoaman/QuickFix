import { NavLink, Route, Routes } from 'react-router-dom';

const serviceHighlights = [
  'Plumbing',
  'Electrical',
  'Appliance repair',
];

function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="QuickFix home">
          <span className="brand-mark" aria-hidden="true">
            QF
          </span>
          <span>QuickFix</span>
        </a>
        <nav className="topnav" aria-label="Primary navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/bookings">My Bookings</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/bookings" element={<BookingsPlaceholder />} />
          <Route path="/admin" element={<AdminPlaceholder />} />
        </Routes>
      </main>
    </div>
  );
}

function HomeView() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">Frontend-only service scheduling</p>
        <h1 id="hero-title">QuickFix</h1>
        <p>
          A clean app shell for customers and admins to explore repair services,
          manage local bookings, and keep the MVP deployable as static assets.
        </p>
        <div className="actions" aria-label="Available app areas">
          <NavLink className="button primary" to="/bookings">
            View bookings
          </NavLink>
          <NavLink className="button secondary" to="/admin">
            Admin view
          </NavLink>
        </div>
      </div>

      <div className="service-panel" aria-label="Service categories">
        {serviceHighlights.map((service) => (
          <article className="service-card" key={service}>
            <span aria-hidden="true" />
            <h2>{service}</h2>
            <p>Ready for the booking flow in the next feature slice.</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function BookingsPlaceholder() {
  return (
    <section className="page-panel" aria-labelledby="bookings-title">
      <p className="eyebrow">Customer workspace</p>
      <h1 id="bookings-title">My Bookings</h1>
      <p>No customer booking data is stored in this scaffold.</p>
    </section>
  );
}

function AdminPlaceholder() {
  return (
    <section className="page-panel" aria-labelledby="admin-title">
      <p className="eyebrow">Operations workspace</p>
      <h1 id="admin-title">Admin Dashboard</h1>
      <p>Admin summaries will appear after local booking state is added.</p>
    </section>
  );
}

export default App;

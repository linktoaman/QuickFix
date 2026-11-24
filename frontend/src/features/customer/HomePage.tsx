import { Link } from 'react-router-dom';

import { SERVICE_CATALOG } from '../../domain/booking';

function HomePage() {
  return (
    <section className="home-page" aria-labelledby="home-page-title">
      <div className="home-page__hero">
        <div className="home-page__copy">
          <p className="eyebrow">Common home services, booked online</p>
          <h1 id="home-page-title">
            Book trusted home help without calling support.
          </h1>
          <p>
            Choose plumbing, electrical, or appliance repair, pick a time that
            works, and keep every QuickFix booking organized in your browser.
          </p>
          <div className="actions" aria-label="Customer booking shortcuts">
            <Link className="button primary" to="/book">
              Book a service
            </Link>
            <Link className="button secondary" to="/my-bookings">
              My Bookings
            </Link>
          </div>
        </div>

        <aside className="home-page__privacy-note" aria-labelledby="privacy-title">
          <p className="eyebrow">Browser-only demo storage</p>
          <h2 id="privacy-title">Your details stay on this device.</h2>
          <p>
            QuickFix stores demo bookings in localStorage for this browser-only
            MVP. Nothing is sent to a backend, support team, analytics service,
            or third-party provider.
          </p>
        </aside>
      </div>

      <section className="home-page__services" aria-labelledby="services-title">
        <div className="home-page__section-heading">
          <p className="eyebrow">Start with a service</p>
          <h2 id="services-title">What needs fixing?</h2>
        </div>

        <div className="home-page__service-grid">
          {SERVICE_CATALOG.map((service) => (
            <article className="home-service-card" key={service.id}>
              <div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
              </div>
              <Link
                className="button secondary"
                to={`/book?service=${service.id}`}
              >
                Book {service.name}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default HomePage;

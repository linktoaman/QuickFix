import { Link, useSearchParams } from 'react-router-dom';

import { SERVICE_CATALOG, getServiceById } from '../../domain/booking';
import BookingForm from './BookingForm';

function BookingPage() {
  const [searchParams] = useSearchParams();
  const requestedService = searchParams.get('service') ?? '';
  const selectedService = getServiceById(requestedService);
  const initialService = selectedService?.id;

  return (
    <section className="booking-page" aria-labelledby="booking-page-title">
      <div className="booking-page__hero">
        <div className="booking-page__copy">
          <p className="eyebrow">Create booking</p>
          <h1 id="booking-page-title">Schedule an appointment</h1>
          <p>
            Tell QuickFix what needs attention, choose a service window, and
            your request will be saved locally with Pending status.
          </p>
        </div>

        <aside className="booking-page__services" aria-label="Service catalog">
          <h2>Services</h2>
          <div className="booking-page__service-list">
            {SERVICE_CATALOG.map((service) => (
              <Link
                className={
                  service.id === initialService
                    ? 'booking-service-link booking-service-link--selected'
                    : 'booking-service-link'
                }
                key={service.id}
                to={`/book?service=${service.id}`}
              >
                <span>{service.name}</span>
                <small>{service.description}</small>
              </Link>
            ))}
          </div>
        </aside>
      </div>

      <div className="booking-page__form-panel">
        {selectedService === null ? null : (
          <p className="booking-page__preselected">
            {selectedService.name} is selected for this appointment.
          </p>
        )}
        <BookingForm
          key={initialService ?? 'no-service'}
          initialService={initialService}
        />
      </div>
    </section>
  );
}

export default BookingPage;

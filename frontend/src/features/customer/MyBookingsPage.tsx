import { useState } from 'react';
import { Link } from 'react-router-dom';

import BookingCard from '../../components/BookingCard';
import Message from '../../components/ui/Message';
import useBookings from '../../hooks/useBookings';
import useRole from '../../hooks/useRole';

type CancellationMessage = {
  tone: 'success' | 'error';
  text: string;
};

function MyBookingsPage() {
  const { selectedCustomerId } = useRole();
  const { cancelBooking, getBookingsForCustomer, storageError } = useBookings();
  const [cancellationMessage, setCancellationMessage] =
    useState<CancellationMessage | null>(null);
  const customerBookings = selectedCustomerId === null
    ? []
    : getBookingsForCustomer(selectedCustomerId);

  function handleCancelBooking(bookingId: string) {
    if (selectedCustomerId === null) {
      return;
    }

    const result = cancelBooking(bookingId, selectedCustomerId);

    if (!result.ok) {
      setCancellationMessage({
        tone: 'error',
        text: result.error,
      });
      return;
    }

    setCancellationMessage({
      tone: 'success',
      text: `${result.booking.serviceName} booking cancelled.`,
    });
  }

  return (
    <section className="my-bookings-page" aria-labelledby="my-bookings-title">
      <div className="my-bookings-page__hero">
        <div className="my-bookings-page__copy">
          <p className="eyebrow">Customer view / My bookings</p>
          <h1 id="my-bookings-title">My bookings</h1>
          <p>
            Review your QuickFix appointment history, track each request status,
            and keep your locally saved service details in one place.
          </p>
        </div>
        <Link className="qf-button qf-button--primary" to="/book">
          Book a service
        </Link>
      </div>

      {storageError === null ? null : (
        <Message title="Booking storage issue" tone="error">
          {storageError}
        </Message>
      )}

      {cancellationMessage === null ? null : (
        <Message tone={cancellationMessage.tone} aria-live="polite">
          {cancellationMessage.text}
        </Message>
      )}

      {customerBookings.length > 0 ? (
        <div className="my-bookings-page__grid" aria-label="Booking history">
          {customerBookings.map((booking) => (
            <BookingCard
              booking={booking}
              key={booking.id}
              onCancel={handleCancelBooking}
            />
          ))}
        </div>
      ) : (
        <div className="my-bookings-page__empty">
          <div>
            <p className="eyebrow">No booking history</p>
            <h2>No bookings yet</h2>
            <p>
              Your submitted appointments will appear here after you book a
              service.
            </p>
          </div>
          <Link className="qf-button qf-button--primary" to="/book">
            Book a service
          </Link>
        </div>
      )}
    </section>
  );
}

export default MyBookingsPage;

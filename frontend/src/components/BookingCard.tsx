import { canCustomerCancel } from '../domain/booking';
import type { Booking } from '../types/booking';
import Button from './ui/Button';
import Card from './ui/Card';
import StatusBadge from './ui/StatusBadge';

type BookingCardProps = {
  booking: Booking;
  onCancel?: (bookingId: string) => void;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});

function BookingCard({ booking, onCancel }: BookingCardProps) {
  const appointmentLabel = formatAppointment(
    booking.appointmentDate,
    booking.appointmentTime,
  );
  const description = booking.description ?? 'No description provided';
  const canCancel = onCancel !== undefined && canCustomerCancel(booking.status);
  const cancellationHint = getCancellationHint(booking.status);

  function handleCancel() {
    onCancel?.(booking.id);
  }

  return (
    <Card className="booking-card" elevated>
      <div className="booking-card__header">
        <div className="booking-card__title-group">
          <p className="eyebrow">Service booking</p>
          <h2>{booking.serviceName}</h2>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <dl className="booking-card__details">
        <div>
          <dt>Date and time</dt>
          <dd>{appointmentLabel}</dd>
        </div>
        <div>
          <dt>Name</dt>
          <dd>{booking.customerName}</dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>{booking.phone}</dd>
        </div>
        <div>
          <dt>Address</dt>
          <dd>{booking.address}</dd>
        </div>
        <div className="booking-card__description">
          <dt>Description</dt>
          <dd>{description}</dd>
        </div>
      </dl>

      {canCancel ? (
        <div>
          <Button
            aria-label={`Cancel ${booking.serviceName} booking`}
            onClick={handleCancel}
            variant="secondary"
          >
            Cancel booking
          </Button>
        </div>
      ) : null}

      {!canCancel && cancellationHint !== null ? (
        <p className="qf-field__hint">{cancellationHint}</p>
      ) : null}
    </Card>
  );
}

function formatAppointment(dateValue: string, timeValue: string) {
  return `${formatDate(dateValue)} at ${formatTime(timeValue)}`;
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map((part) => Number(part));

  if (!isValidDateParts(year, month, day)) {
    return value;
  }

  return dateFormatter.format(new Date(year, month - 1, day));
}

function formatTime(value: string) {
  const [hour, minute] = value.split(':').map((part) => Number(part));

  if (
    !Number.isInteger(hour)
    || !Number.isInteger(minute)
    || hour < 0
    || hour > 23
    || minute < 0
    || minute > 59
  ) {
    return value;
  }

  return timeFormatter.format(new Date(2024, 0, 1, hour, minute));
}

function isValidDateParts(
  year: number,
  month: number,
  day: number,
) {
  if (
    !Number.isInteger(year)
    || !Number.isInteger(month)
    || !Number.isInteger(day)
    || month < 1
    || month > 12
    || day < 1
    || day > 31
  ) {
    return false;
  }

  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day;
}

function getCancellationHint(status: Booking['status']) {
  if (status === 'Completed') {
    return 'Completed bookings are closed and cannot be cancelled.';
  }

  if (status === 'Cancelled') {
    return 'This booking has already been cancelled.';
  }

  return null;
}

export default BookingCard;

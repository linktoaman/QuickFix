import { useState } from 'react';

import StatusBadge from '../../components/ui/StatusBadge';
import { mockCustomers } from '../../data/mockCustomers';
import { BOOKING_STATUSES } from '../../domain/booking';
import useBookings from '../../hooks/useBookings';
import type { Booking } from '../../types/booking';

type StatusUpdateMessage = {
  bookingId: string;
  text: string;
  tone: 'success' | 'error';
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

function AdminBookingsTable() {
  const { getAllBookings, storageError, updateBookingStatus } = useBookings();
  const [statusUpdateMessage, setStatusUpdateMessage] =
    useState<StatusUpdateMessage | null>(null);
  const bookings = getAllBookings();

  function handleStatusChange(booking: Booking, nextStatus: string) {
    const result = updateBookingStatus(booking.id, nextStatus);

    if (!result.ok) {
      setStatusUpdateMessage({
        bookingId: booking.id,
        text: result.error,
        tone: 'error',
      });
      return;
    }

    setStatusUpdateMessage({
      bookingId: booking.id,
      text: `${result.booking.serviceName} booking set to ${result.booking.status}.`,
      tone: 'success',
    });
  }

  return (
    <section className="admin-bookings" aria-labelledby="admin-bookings-title">
      <div className="admin-bookings__header">
        <div>
          <p className="eyebrow">All bookings</p>
          <h2 id="admin-bookings-title">Booking operations</h2>
        </div>
        <p>
          Status changes are saved locally and reflected in customer booking
          history after refresh.
        </p>
      </div>

      {storageError === null ? null : (
        <p className="admin-bookings__message admin-bookings__message--error">
          {storageError}
        </p>
      )}

      {bookings.length > 0 ? (
        <div className="admin-bookings__table-wrap">
          <table className="admin-bookings__table">
            <caption>
              All local QuickFix bookings with customer details and status
              controls
            </caption>
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Phone</th>
                <th scope="col">Address</th>
                <th scope="col">Service</th>
                <th scope="col">Appointment</th>
                <th scope="col">Problem</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td data-label="Customer">
                    <span className="admin-bookings__primary">
                      {booking.customerName}
                    </span>
                    <span className="admin-bookings__secondary">
                      {getMockCustomerLabel(booking.customerId)}
                    </span>
                  </td>
                  <td data-label="Phone">{booking.phone}</td>
                  <td data-label="Address">{booking.address}</td>
                  <td data-label="Service">{booking.serviceName}</td>
                  <td data-label="Appointment">
                    {formatAppointment(
                      booking.appointmentDate,
                      booking.appointmentTime,
                    )}
                  </td>
                  <td data-label="Problem">
                    {booking.description ?? 'No problem description provided'}
                  </td>
                  <td data-label="Status">
                    <div className="admin-bookings__status-cell">
                      <StatusBadge status={booking.status} />
                      <label className="admin-bookings__status-field">
                        <span>
                          Update status for {booking.customerName}
                        </span>
                        <select
                          aria-describedby={
                            statusUpdateMessage?.bookingId === booking.id
                              ? `status-message-${booking.id}`
                              : undefined
                          }
                          value={booking.status}
                          onChange={(event) => {
                            handleStatusChange(booking, event.target.value);
                          }}
                        >
                          {BOOKING_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>
                      {statusUpdateMessage?.bookingId === booking.id ? (
                        <span
                          className={
                            `admin-bookings__inline-message `
                            + `admin-bookings__inline-message--${statusUpdateMessage.tone}`
                          }
                          id={`status-message-${booking.id}`}
                          role={
                            statusUpdateMessage.tone === 'error'
                              ? 'alert'
                              : 'status'
                          }
                        >
                          {statusUpdateMessage.text}
                        </span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-bookings__empty">
          <p className="eyebrow">No bookings available</p>
          <h3>No local bookings yet</h3>
          <p>
            Customer service requests will appear here after a booking is
            submitted in this browser.
          </p>
        </div>
      )}
    </section>
  );
}

function getMockCustomerLabel(customerId: string) {
  const customer = mockCustomers.find((item) => item.id === customerId);

  if (customer === undefined) {
    return 'Mock customer: Unknown';
  }

  return `Mock customer: ${customer.displayName} (${customer.neighborhood})`;
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

export default AdminBookingsTable;

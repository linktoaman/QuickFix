import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BookingProvider } from '../BookingContext';
import { RoleContext } from '../roleContext';
import { QUICKFIX_BOOKINGS_STORAGE_KEY } from '../../storage/localStorageAdapter';
import useBookings from '../../hooks/useBookings';
import type { Booking } from '../../types/booking';

function createBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-admin-selector-test-id',
    customerId: 'customer-alex-rivera',
    serviceId: 'plumbing',
    serviceName: 'Plumbing',
    customerName: 'Alex Rivera',
    phone: '+1 555-010-0123',
    address: '123 Maple Street',
    appointmentDate: '2099-04-10',
    appointmentTime: '13:15',
    description: 'Bathroom sink is leaking under the cabinet.',
    status: 'Pending',
    createdAt: '2026-01-01T12:00:00.000Z',
    updatedAt: '2026-01-01T12:00:00.000Z',
    ...overrides,
  };
}

function AdminSelectorProbe() {
  const { getAllBookings, getStatusCounts, updateBookingStatus } = useBookings();
  const bookings = getAllBookings();
  const statusCounts = getStatusCounts();

  return (
    <>
      <p>All bookings: {bookings.length}</p>
      <p>Pending count: {statusCounts.Pending}</p>
      <p>Confirmed count: {statusCounts.Confirmed}</p>
      <p>Completed count: {statusCounts.Completed}</p>
      <p>Cancelled count: {statusCounts.Cancelled}</p>
      <ul>
        {bookings.map((booking) => (
          <li key={booking.id}>
            {booking.customerName}: {booking.serviceName}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => {
          updateBookingStatus('booking-alex-pending', 'Confirmed');
        }}
      >
        Confirm Alex booking
      </button>
    </>
  );
}

function renderBookingProvider(children: ReactNode = <AdminSelectorProbe />) {
  render(
    <RoleContext.Provider
      value={{
        selectedRole: 'admin',
        selectedCustomerId: null,
        selectRole: vi.fn(),
        selectCustomer: vi.fn(),
        clearRole: vi.fn(),
      }}
    >
      <BookingProvider>
        {children}
      </BookingProvider>
    </RoleContext.Provider>,
  );
}

function storeBookings(bookings: Booking[]) {
  window.localStorage.setItem(
    QUICKFIX_BOOKINGS_STORAGE_KEY,
    JSON.stringify({ bookings }),
  );
}

function readStoredBookings() {
  const storedValue = window.localStorage.getItem(QUICKFIX_BOOKINGS_STORAGE_KEY);

  return JSON.parse(storedValue ?? '{}') as {
    bookings?: Booking[];
  };
}

describe('admin booking selectors', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('XMLHttpRequest', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns all bookings and derives status counts across customers', async () => {
    storeBookings([
      createBooking({
        id: 'booking-alex-pending',
        status: 'Pending',
      }),
      createBooking({
        id: 'booking-maya-confirmed',
        customerId: 'customer-maya-patel',
        serviceName: 'Electrical',
        customerName: 'Maya Patel',
        status: 'Confirmed',
      }),
      createBooking({
        id: 'booking-alex-completed',
        serviceId: 'appliance-repair',
        serviceName: 'Appliance repair',
        status: 'Completed',
      }),
      createBooking({
        id: 'booking-maya-cancelled',
        customerId: 'customer-maya-patel',
        serviceName: 'Appliance repair',
        customerName: 'Maya Patel',
        status: 'Cancelled',
      }),
    ]);

    renderBookingProvider();

    await waitFor(() => {
      expect(screen.getByText('All bookings: 4')).toBeInTheDocument();
    });

    expect(screen.getByText('Alex Rivera: Plumbing')).toBeInTheDocument();
    expect(screen.getByText('Alex Rivera: Appliance repair')).toBeInTheDocument();
    expect(screen.getByText('Maya Patel: Electrical')).toBeInTheDocument();
    expect(screen.getByText('Maya Patel: Appliance repair')).toBeInTheDocument();
    expect(screen.getByText('Pending count: 1')).toBeInTheDocument();
    expect(screen.getByText('Confirmed count: 1')).toBeInTheDocument();
    expect(screen.getByText('Completed count: 1')).toBeInTheDocument();
    expect(screen.getByText('Cancelled count: 1')).toBeInTheDocument();
  });

  it('persists status updates locally and does not call backend APIs', async () => {
    const fetchMock = vi.mocked(fetch);
    const xhrMock = vi.mocked(XMLHttpRequest);

    storeBookings([
      createBooking({
        id: 'booking-alex-pending',
        status: 'Pending',
      }),
      createBooking({
        id: 'booking-maya-completed',
        customerId: 'customer-maya-patel',
        serviceName: 'Electrical',
        customerName: 'Maya Patel',
        status: 'Completed',
      }),
    ]);

    renderBookingProvider();

    await waitFor(() => {
      expect(screen.getByText('Pending count: 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', {
      name: 'Confirm Alex booking',
    }));

    await waitFor(() => {
      expect(screen.getByText('Pending count: 0')).toBeInTheDocument();
    });
    expect(screen.getByText('Confirmed count: 1')).toBeInTheDocument();
    expect(screen.getByText('Completed count: 1')).toBeInTheDocument();

    const payload = readStoredBookings();
    const updatedBooking = payload.bookings?.find(
      (booking) => booking.id === 'booking-alex-pending',
    );
    const otherBooking = payload.bookings?.find(
      (booking) => booking.id === 'booking-maya-completed',
    );

    expect(updatedBooking?.status).toBe('Confirmed');
    expect(otherBooking?.status).toBe('Completed');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(xhrMock).not.toHaveBeenCalled();
  });
});

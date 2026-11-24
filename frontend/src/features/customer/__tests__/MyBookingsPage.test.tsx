import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import MyBookingsPage from '../MyBookingsPage';
import { BookingProvider } from '../../../state/BookingContext';
import { RoleContext } from '../../../state/roleContext';
import { QUICKFIX_BOOKINGS_STORAGE_KEY } from '../../../storage/localStorageAdapter';
import type { MockCustomerId } from '../../../data/mockCustomers';
import type { Booking } from '../../../types/booking';

function createBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-my-bookings-test-id',
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

function renderMyBookingsPage(
  customerId: MockCustomerId | null = 'customer-alex-rivera',
) {
  render(
    <MemoryRouter>
      <RoleContext.Provider
        value={{
          selectedRole: 'customer',
          selectedCustomerId: customerId,
          selectRole: vi.fn(),
          selectCustomer: vi.fn(),
          clearRole: vi.fn(),
        }}
      >
        <BookingProvider>
          <MyBookingsPage />
        </BookingProvider>
      </RoleContext.Provider>
    </MemoryRouter>,
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

describe('MyBookingsPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('filters bookings to the selected mock customer', async () => {
    storeBookings([
      createBooking({
        id: 'booking-alex-pending',
        serviceName: 'Plumbing',
        description: 'Alex bathroom sink leak.',
      }),
      createBooking({
        id: 'booking-maya-pending',
        customerId: 'customer-maya-patel',
        serviceName: 'Electrical',
        customerName: 'Maya Patel',
        description: 'Maya dining room light repair.',
      }),
    ]);

    renderMyBookingsPage();

    await waitFor(() => {
      expect(screen.getByText('Alex bathroom sink leak.')).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'Plumbing' })).toBeInTheDocument();
    expect(screen.queryByText('Maya dining room light repair.')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Electrical' })).not.toBeInTheDocument();
  });

  it('renders the empty state when the selected customer has no bookings', async () => {
    storeBookings([
      createBooking({
        id: 'booking-maya-only',
        customerId: 'customer-maya-patel',
        serviceName: 'Electrical',
        customerName: 'Maya Patel',
      }),
    ]);

    renderMyBookingsPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'No bookings yet' })).toBeInTheDocument();
    });
    expect(
      screen.getByText('Your submitted appointments will appear here after you book a service.'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Book a service' })).toHaveLength(2);
  });

  it('persists a successful cancellation and updates the UI', async () => {
    storeBookings([
      createBooking({
        id: 'booking-alex-confirmed',
        status: 'Confirmed',
        serviceName: 'Appliance repair',
        serviceId: 'appliance-repair',
      }),
      createBooking({
        id: 'booking-maya-pending',
        customerId: 'customer-maya-patel',
        serviceName: 'Electrical',
        customerName: 'Maya Patel',
      }),
    ]);

    renderMyBookingsPage();

    await waitFor(() => {
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', {
      name: 'Cancel Appliance repair booking',
    }));

    expect(screen.getByRole('status')).toHaveTextContent(
      'Appliance repair booking cancelled.',
    );

    await waitFor(() => {
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', {
      name: 'Cancel Appliance repair booking',
    })).not.toBeInTheDocument();
    expect(
      screen.getByText('This booking has already been cancelled.'),
    ).toBeInTheDocument();

    const payload = readStoredBookings();
    const cancelledBooking = payload.bookings?.find(
      (booking) => booking.id === 'booking-alex-confirmed',
    );
    const otherCustomerBooking = payload.bookings?.find(
      (booking) => booking.id === 'booking-maya-pending',
    );

    expect(cancelledBooking?.status).toBe('Cancelled');
    expect(otherCustomerBooking?.status).toBe('Pending');
  });
});

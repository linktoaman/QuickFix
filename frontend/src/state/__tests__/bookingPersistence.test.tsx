import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSeedBookings } from '../../data/seedBookings';
import useBookings from '../../hooks/useBookings';
import { QUICKFIX_BOOKINGS_STORAGE_KEY } from '../../storage/localStorageAdapter';
import type { Booking, BookingFormInput, BookingStatus } from '../../types/booking';
import { BookingProvider } from '../BookingContext';
import { RoleContext } from '../roleContext';

const validBookingInput: BookingFormInput = {
  service: 'electrical',
  name: 'Maya Patel',
  phone: '+1 555-010-0987',
  address: '456 Oak Avenue',
  date: '2099-02-20',
  time: '14:45',
  description: 'Dining room fixture flickers after a few minutes.',
};

function BookingSnapshot() {
  const { bookings, createBooking, storageError } = useBookings();

  function handleCreateBooking() {
    createBooking(validBookingInput);
  }

  return (
    <>
      <p>Booking count: {bookings.length}</p>
      <p>Storage error: {storageError ?? 'none'}</p>
      <ul>
        {bookings.map((booking) => (
          <li key={booking.id}>
            {booking.id}: {booking.status}
          </li>
        ))}
      </ul>
      <button type="button" onClick={handleCreateBooking}>
        Create booking
      </button>
    </>
  );
}

function BookingMutations() {
  const { cancelBooking, updateBookingStatus } = useBookings();

  function handleConfirmBooking() {
    updateBookingStatus('booking-persistence-pending', 'Confirmed');
  }

  function handleCancelBooking() {
    cancelBooking('booking-persistence-confirmed', 'customer-alex-rivera');
  }

  return (
    <>
      <BookingSnapshot />
      <button type="button" onClick={handleConfirmBooking}>
        Confirm pending
      </button>
      <button type="button" onClick={handleCancelBooking}>
        Cancel confirmed
      </button>
    </>
  );
}

function renderBookingProvider(children: ReactNode = <BookingSnapshot />) {
  return render(
    <RoleContext.Provider
      value={{
        selectedRole: 'customer',
        selectedCustomerId: 'customer-alex-rivera',
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

function createStoredBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-persistence-test',
    customerId: 'customer-alex-rivera',
    serviceId: 'plumbing',
    serviceName: 'Plumbing',
    customerName: 'Alex Rivera',
    phone: '+1 555-010-0142',
    address: '214 North Loop Avenue',
    appointmentDate: '2099-02-20',
    appointmentTime: '09:30',
    description: 'Kitchen sink drain is running slowly.',
    status: 'Pending',
    createdAt: '2026-01-01T12:00:00.000Z',
    updatedAt: '2026-01-01T12:00:00.000Z',
    ...overrides,
  };
}

function writeStoredPayload(bookings: readonly Booking[]) {
  window.localStorage.setItem(
    QUICKFIX_BOOKINGS_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: 1,
      bookings: bookings.reduce<Record<string, Booking>>((bookingsById, booking) => ({
        ...bookingsById,
        [booking.id]: booking,
      }), {}),
    }),
  );
}

function readStoredBookingsById(): Record<string, Booking> {
  const storedValue = window.localStorage.getItem(QUICKFIX_BOOKINGS_STORAGE_KEY);
  const payload = JSON.parse(storedValue ?? '{}') as {
    bookings?: Record<string, Booking>;
  };

  return payload.bookings ?? {};
}

describe('BookingProvider persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('XMLHttpRequest', vi.fn());
    vi.stubGlobal('crypto', {
      randomUUID: () => 'booking-persistence-created',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('seeds demo bookings when the bookings key is absent', async () => {
    renderBookingProvider();

    await waitFor(() => {
      expect(screen.getByText('Booking count: 3')).toBeInTheDocument();
    });

    const storedBookingsById = readStoredBookingsById();

    expect(Object.values(storedBookingsById).map((booking) => booking.id).sort()).toEqual(
      createSeedBookings().map((booking) => booking.id).sort(),
    );
    expect(fetch).not.toHaveBeenCalled();
    expect(XMLHttpRequest).not.toHaveBeenCalled();
  });

  it('does not overwrite existing localStorage booking data on mount', async () => {
    const existingBooking = createStoredBooking({
      id: 'booking-existing-record',
      description: 'Keep this existing browser booking.',
    });

    writeStoredPayload([existingBooking]);
    const originalStoredValue = window.localStorage.getItem(QUICKFIX_BOOKINGS_STORAGE_KEY);

    renderBookingProvider();

    await waitFor(() => {
      expect(screen.getByText('Booking count: 1')).toBeInTheDocument();
    });

    expect(window.localStorage.getItem(QUICKFIX_BOOKINGS_STORAGE_KEY)).toBe(
      originalStoredValue,
    );
    expect(screen.getByText('booking-existing-record: Pending')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    expect(XMLHttpRequest).not.toHaveBeenCalled();
  });

  it('rehydrates a created booking after the provider remounts', async () => {
    const firstRender = renderBookingProvider();

    await waitFor(() => {
      expect(screen.getByText('Booking count: 3')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create booking' }));

    await waitFor(() => {
      expect(screen.getByText('Booking count: 4')).toBeInTheDocument();
    });

    firstRender.unmount();
    renderBookingProvider();

    await waitFor(() => {
      expect(screen.getByText('Booking count: 4')).toBeInTheDocument();
    });

    expect(
      screen.getByText('booking-booking-persistence-created: Pending'),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    expect(XMLHttpRequest).not.toHaveBeenCalled();
  });

  it('persists admin status updates and customer cancellations', async () => {
    writeStoredPayload([
      createStoredBooking({
        id: 'booking-persistence-pending',
        status: 'Pending',
      }),
      createStoredBooking({
        id: 'booking-persistence-confirmed',
        status: 'Confirmed',
      }),
    ]);

    renderBookingProvider(<BookingMutations />);

    await waitFor(() => {
      expect(screen.getByText('Booking count: 2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Confirm pending' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel confirmed' }));

    await waitFor(() => {
      const persistedBookings = readStoredBookingsById();
      const persistedStatuses: Record<string, BookingStatus | undefined> = {
        pending: persistedBookings['booking-persistence-pending']?.status,
        confirmed: persistedBookings['booking-persistence-confirmed']?.status,
      };

      expect(persistedStatuses).toEqual({
        pending: 'Confirmed',
        confirmed: 'Cancelled',
      });
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(XMLHttpRequest).not.toHaveBeenCalled();
  });

  it('surfaces parse failures without seeding over malformed localStorage data', async () => {
    window.localStorage.setItem(QUICKFIX_BOOKINGS_STORAGE_KEY, '{broken-json');

    renderBookingProvider();

    await waitFor(() => {
      expect(
        screen.getByText('Storage error: Booking storage is unavailable. Please try again.'),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Booking count: 0')).toBeInTheDocument();
    expect(window.localStorage.getItem(QUICKFIX_BOOKINGS_STORAGE_KEY)).toBe('{broken-json');
    expect(fetch).not.toHaveBeenCalled();
    expect(XMLHttpRequest).not.toHaveBeenCalled();
  });
});

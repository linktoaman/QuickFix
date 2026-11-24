import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BookingProvider } from '../BookingContext';
import { RoleContext } from '../roleContext';
import { QUICKFIX_BOOKINGS_STORAGE_KEY } from '../../storage/localStorageAdapter';
import useBookings from '../../hooks/useBookings';
import type { Booking, BookingFormInput } from '../../types/booking';

const validBookingInput: BookingFormInput = {
  service: 'electrical',
  name: 'Maya Patel',
  phone: '+1 555-010-0987',
  address: '456 Oak Avenue',
  date: '2099-02-20',
  time: '14:45',
  description: 'Dining room fixture flickers after a few minutes.',
};

function BookingCreator() {
  const { createBooking } = useBookings();

  function handleCreateBooking() {
    const result = createBooking(validBookingInput);

    if (!result.ok) {
      return;
    }
  }

  return (
    <button type="button" onClick={handleCreateBooking}>
      Save booking
    </button>
  );
}

function BookingManager() {
  const { cancelBooking, getBookingsForCustomer } = useBookings();
  const alexBookings = getBookingsForCustomer('customer-alex-rivera');
  const mayaBookings = getBookingsForCustomer('customer-maya-patel');

  function handleCancelPending() {
    cancelBooking('booking-pending', 'customer-alex-rivera');
  }

  function handleCancelCompleted() {
    cancelBooking('booking-completed', 'customer-alex-rivera');
  }

  function handleCancelOtherCustomerBooking() {
    cancelBooking('booking-maya-pending', 'customer-alex-rivera');
  }

  return (
    <>
      <p>Alex bookings: {alexBookings.length}</p>
      <p>Maya bookings: {mayaBookings.length}</p>
      <button type="button" onClick={handleCancelPending}>
        Cancel pending
      </button>
      <button type="button" onClick={handleCancelCompleted}>
        Cancel completed
      </button>
      <button type="button" onClick={handleCancelOtherCustomerBooking}>
        Cancel other customer booking
      </button>
    </>
  );
}

function renderBookingProvider(children: ReactNode = <BookingCreator />) {
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

function createStoredBooking(overrides: Partial<Booking>): Booking {
  return {
    id: 'booking-test-id',
    customerId: 'customer-alex-rivera',
    serviceId: 'electrical',
    serviceName: 'Electrical',
    customerName: 'Maya Patel',
    phone: '+1 555-010-0987',
    address: '456 Oak Avenue',
    appointmentDate: '2099-02-20',
    appointmentTime: '14:45',
    description: 'Dining room fixture flickers after a few minutes.',
    status: 'Pending',
    createdAt: '2026-01-01T12:00:00.000Z',
    updatedAt: '2026-01-01T12:00:00.000Z',
    ...overrides,
  };
}

function readStoredBookingPayload() {
  const storedValue = window.localStorage.getItem(QUICKFIX_BOOKINGS_STORAGE_KEY);

  return JSON.parse(storedValue ?? '{}') as {
    bookings?: Booking[];
  };
}

describe('BookingProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('XMLHttpRequest', vi.fn());
    vi.stubGlobal('crypto', {
      randomUUID: () => 'booking-context-test-id',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('persists a created booking to localStorage without network calls', () => {
    const fetchMock = vi.mocked(fetch);
    const xhrMock = vi.mocked(XMLHttpRequest);

    renderBookingProvider();

    fireEvent.click(screen.getByRole('button', { name: 'Save booking' }));

    const storedValue = window.localStorage.getItem(QUICKFIX_BOOKINGS_STORAGE_KEY);

    expect(storedValue).not.toBeNull();

    const payload = readStoredBookingPayload();

    expect(payload.bookings).toHaveLength(1);
    expect(payload.bookings?.[0]).toEqual(
      expect.objectContaining({
        id: 'booking-booking-context-test-id',
        customerId: 'customer-alex-rivera',
        serviceId: 'electrical',
        serviceName: 'Electrical',
        customerName: 'Maya Patel',
        phone: '+1 555-010-0987',
        address: '456 Oak Avenue',
        appointmentDate: '2099-02-20',
        appointmentTime: '14:45',
        description: 'Dining room fixture flickers after a few minutes.',
        status: 'Pending',
      }),
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(xhrMock).not.toHaveBeenCalled();
  });

  it('selects bookings by customer and cancels only eligible owned bookings', async () => {
    window.localStorage.setItem(
      QUICKFIX_BOOKINGS_STORAGE_KEY,
      JSON.stringify({
        bookings: [
          createStoredBooking({
            id: 'booking-pending',
            status: 'Pending',
          }),
          createStoredBooking({
            id: 'booking-confirmed',
            status: 'Confirmed',
          }),
          createStoredBooking({
            id: 'booking-completed',
            status: 'Completed',
          }),
          createStoredBooking({
            id: 'booking-cancelled',
            status: 'Cancelled',
          }),
          createStoredBooking({
            id: 'booking-maya-pending',
            customerId: 'customer-maya-patel',
            status: 'Pending',
          }),
        ],
      }),
    );

    renderBookingProvider(<BookingManager />);

    await waitFor(() => {
      expect(screen.getByText('Alex bookings: 4')).toBeInTheDocument();
    });
    expect(screen.getByText('Maya bookings: 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel pending' }));

    let payload = readStoredBookingPayload();

    expect(payload.bookings).toHaveLength(5);
    const pendingBooking = payload.bookings?.find(
      (booking) => booking.id === 'booking-pending',
    );

    expect(pendingBooking?.status).toBe('Cancelled');

    fireEvent.click(screen.getByRole('button', { name: 'Cancel completed' }));
    fireEvent.click(screen.getByRole('button', {
      name: 'Cancel other customer booking',
    }));

    payload = readStoredBookingPayload();

    expect(payload.bookings).toHaveLength(5);
    const completedBooking = payload.bookings?.find(
      (booking) => booking.id === 'booking-completed',
    );
    const otherCustomerBooking = payload.bookings?.find(
      (booking) => booking.id === 'booking-maya-pending',
    );

    expect(completedBooking?.status).toBe('Completed');
    expect(otherCustomerBooking?.status).toBe('Pending');
  });
});

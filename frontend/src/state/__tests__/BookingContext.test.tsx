import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BookingProvider } from '../BookingContext';
import { RoleContext } from '../roleContext';
import { QUICKFIX_BOOKINGS_STORAGE_KEY } from '../../storage/localStorageAdapter';
import useBookings from '../../hooks/useBookings';
import type { BookingFormInput } from '../../types/booking';

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

function renderBookingProvider() {
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
        <BookingCreator />
      </BookingProvider>
    </RoleContext.Provider>,
  );
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

    const payload = JSON.parse(storedValue ?? '{}') as {
      bookings?: Array<Record<string, unknown>>;
    };

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
});

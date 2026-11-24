import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminStats from '../AdminStats';
import { BookingProvider } from '../../../state/BookingContext';
import { RoleContext } from '../../../state/roleContext';
import { QUICKFIX_BOOKINGS_STORAGE_KEY } from '../../../storage/localStorageAdapter';
import type { Booking } from '../../../types/booking';

function createBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-admin-stats-test-id',
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

function storeBookings(bookings: Booking[]) {
  window.localStorage.setItem(
    QUICKFIX_BOOKINGS_STORAGE_KEY,
    JSON.stringify({ bookings }),
  );
}

function renderAdminStats() {
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
        <AdminStats />
      </BookingProvider>
    </RoleContext.Provider>,
  );
}

describe('AdminStats', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('derives summary counts by status from stored bookings', async () => {
    storeBookings([
      createBooking({
        id: 'booking-pending',
        status: 'Pending',
      }),
      createBooking({
        id: 'booking-confirmed',
        customerId: 'customer-maya-patel',
        status: 'Confirmed',
      }),
      createBooking({
        id: 'booking-completed',
        status: 'Completed',
      }),
      createBooking({
        id: 'booking-cancelled',
        customerId: 'customer-maya-patel',
        status: 'Cancelled',
      }),
      createBooking({
        id: 'booking-second-pending',
        status: 'Pending',
      }),
    ]);

    renderAdminStats();

    await waitFor(() => {
      expectStatCount('Total', '5');
    });

    expectStatCount('Pending', '2');
    expectStatCount('Confirmed', '1');
    expectStatCount('Completed', '1');
    expectStatCount('Cancelled', '1');
  });
});

function expectStatCount(label: string, count: string) {
  const labelNode = screen.getByText(label, {
    selector: '.qf-admin-stat-card__label',
  });
  const statCard = labelNode.closest('.qf-admin-stat-card');

  expect(statCard).not.toBeNull();
  expect(statCard).toHaveTextContent(count);
}

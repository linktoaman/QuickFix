import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AdminDashboard from '../AdminDashboard';
import { BOOKING_STATUSES } from '../../../domain/booking';
import { BookingProvider } from '../../../state/BookingContext';
import { RoleContext } from '../../../state/roleContext';
import { QUICKFIX_BOOKINGS_STORAGE_KEY } from '../../../storage/localStorageAdapter';
import type { Booking } from '../../../types/booking';

function createBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-admin-dashboard-test-id',
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

function readStoredBookings() {
  const storedValue = window.localStorage.getItem(QUICKFIX_BOOKINGS_STORAGE_KEY);

  return JSON.parse(storedValue ?? '{}') as {
    bookings?: Booking[];
  };
}

function renderAdminDashboard() {
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
        <AdminDashboard />
      </BookingProvider>
    </RoleContext.Provider>,
  );
}

describe('AdminDashboard', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('XMLHttpRequest', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders all bookings across customers in admin mode', async () => {
    storeBookings([
      createBooking({
        id: 'booking-alex-plumbing',
        description: 'Alex bathroom sink leak.',
      }),
      createBooking({
        id: 'booking-maya-electrical',
        customerId: 'customer-maya-patel',
        serviceId: 'electrical',
        serviceName: 'Electrical',
        customerName: 'Maya Patel',
        phone: '+1 555-010-0987',
        address: '456 Oak Avenue',
        description: 'Maya dining room light repair.',
      }),
    ]);

    renderAdminDashboard();

    await waitFor(() => {
      expect(screen.getByText('Alex bathroom sink leak.')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('heading', { name: 'Admin Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Maya dining room light repair.')).toBeInTheDocument();
    expect(
      screen.getByText('Mock customer: Alex Rivera (North Loop)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Mock customer: Maya Patel (Lakeview)'),
    ).toBeInTheDocument();
  });

  it('renders accessible status selects with the allowed status values', async () => {
    storeBookings([
      createBooking({
        id: 'booking-status-labels',
      }),
    ]);

    renderAdminDashboard();

    const select = await screen.findByLabelText('Update status for Alex Rivera');
    const optionLabels = within(select).getAllByRole('option').map(
      (option) => option.textContent,
    );
    const optionValues = within(select).getAllByRole('option').map(
      (option) => option.getAttribute('value'),
    );

    expect(optionLabels).toEqual([...BOOKING_STATUSES]);
    expect(optionValues).toEqual([...BOOKING_STATUSES]);
  });

  it('persists status updates, refreshes counts, and avoids backend requests', async () => {
    const fetchMock = vi.mocked(fetch);
    const xhrMock = vi.mocked(XMLHttpRequest);

    storeBookings([
      createBooking({
        id: 'booking-alex-pending',
        status: 'Pending',
      }),
      createBooking({
        id: 'booking-maya-confirmed',
        customerId: 'customer-maya-patel',
        serviceId: 'electrical',
        serviceName: 'Electrical',
        customerName: 'Maya Patel',
        status: 'Confirmed',
      }),
    ]);

    renderAdminDashboard();

    await waitFor(() => {
      expect(getStatCard('Pending')).toHaveTextContent('1');
    });
    expect(getStatCard('Completed')).toHaveTextContent('0');

    fireEvent.change(screen.getByLabelText('Update status for Alex Rivera'), {
      target: {
        value: 'Completed',
      },
    });

    expect(screen.getByRole('status')).toHaveTextContent(
      'Plumbing booking set to Completed.',
    );

    await waitFor(() => {
      expect(getStatCard('Pending')).toHaveTextContent('0');
    });
    expect(getStatCard('Completed')).toHaveTextContent('1');

    const payload = readStoredBookings();
    const updatedBooking = payload.bookings?.find(
      (booking) => booking.id === 'booking-alex-pending',
    );
    const untouchedBooking = payload.bookings?.find(
      (booking) => booking.id === 'booking-maya-confirmed',
    );

    expect(updatedBooking?.status).toBe('Completed');
    expect(untouchedBooking?.status).toBe('Confirmed');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(xhrMock).not.toHaveBeenCalled();
  });
});

function getStatCard(label: string) {
  const labelNode = screen.getByText(label, {
    selector: '.qf-admin-stat-card__label',
  });
  const statCard = labelNode.closest('.qf-admin-stat-card');

  expect(statCard).not.toBeNull();

  return statCard as HTMLElement;
}

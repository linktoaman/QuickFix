import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AdminDashboard from '../features/admin/AdminDashboard';
import BookingPage from '../features/customer/BookingPage';
import HomePage from '../features/customer/HomePage';
import MyBookingsPage from '../features/customer/MyBookingsPage';
import TopBar from '../layout/TopBar';
import { BookingProvider } from '../state/BookingContext';
import { RoleProvider } from '../state/RoleContext';
import { RoleContext } from '../state/roleContext';
import { QUICKFIX_BOOKINGS_STORAGE_KEY } from '../storage/localStorageAdapter';
import type { MockCustomerId } from '../data/mockCustomers';
import type { Booking } from '../types/booking';

function createBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-accessibility-test-id',
    customerId: 'customer-alex-rivera',
    serviceId: 'plumbing',
    serviceName: 'Plumbing',
    customerName: 'Alex Rivera',
    phone: '+1 555-010-0142',
    address: '214 North Loop Avenue',
    appointmentDate: '2099-04-10',
    appointmentTime: '09:30',
    description: 'Kitchen sink drain is running slowly.',
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

function renderWithProviders(
  element: ReactElement,
  customerId: MockCustomerId | null = 'customer-alex-rivera',
) {
  return render(
    <MemoryRouter>
      <RoleContext.Provider
        value={{
          selectedRole: customerId === null ? 'admin' : 'customer',
          selectedCustomerId: customerId,
          selectRole: vi.fn(),
          selectCustomer: vi.fn(),
          clearRole: vi.fn(),
        }}
      >
        <BookingProvider>{element}</BookingProvider>
      </RoleContext.Provider>
    </MemoryRouter>,
  );
}

function expectFocusable(element: HTMLElement) {
  element.focus();

  expect(element).toHaveFocus();
}

function expectCurrentHeadingsToBeOrdered() {
  const headings = screen.getAllByRole('heading');
  const levels = headings.map((heading) => Number(heading.tagName.slice(1)));

  expect(levels[0]).toBe(1);
  expect(levels.filter((level) => level === 1)).toHaveLength(1);

  levels.slice(1).forEach((level, index) => {
    expect(level).toBeLessThanOrEqual(levels[index] + 1);
  });
}

describe('baseline accessibility coverage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('keeps mock role controls and navigation keyboard reachable', async () => {
    render(
      <MemoryRouter>
        <RoleProvider>
          <TopBar />
        </RoleProvider>
      </MemoryRouter>,
    );

    const modeSelect = screen.getByLabelText('Mode');

    expectFocusable(modeSelect);

    fireEvent.change(modeSelect, {
      target: { value: 'customer' },
    });

    const customerSelect = await screen.findByLabelText('Customer');
    const navigation = screen.getByRole('navigation', {
      name: 'Primary navigation',
    });

    expectFocusable(customerSelect);
    expectFocusable(within(navigation).getByRole('link', { name: 'Services' }));
    expectFocusable(within(navigation).getByRole('link', { name: 'Book' }));
    expectFocusable(within(navigation).getByRole('link', { name: 'My Bookings' }));
  });

  it('labels booking form fields and exposes the submit action to keyboard users', () => {
    storeBookings([]);
    renderWithProviders(<BookingPage />);

    [
      'Service',
      'Customer name',
      'Phone',
      'Address',
      'Appointment date',
      'Appointment time',
      'Problem description',
    ].forEach((label) => {
      expect(screen.getByLabelText(label)).toHaveAccessibleName(label);
    });

    const submitButton = screen.getByRole('button', { name: 'Create booking' });

    expectFocusable(submitButton);
  });

  it('supports keyboard-targeted booking submission, cancellation, and admin status updates', async () => {
    storeBookings([]);
    renderWithProviders(<BookingPage />);

    fireEvent.change(screen.getByLabelText('Service'), {
      target: { value: 'plumbing' },
    });
    fireEvent.change(screen.getByLabelText('Customer name'), {
      target: { value: 'Alex Rivera' },
    });
    fireEvent.change(screen.getByLabelText('Phone'), {
      target: { value: '+1 555-010-0142' },
    });
    fireEvent.change(screen.getByLabelText('Address'), {
      target: { value: '214 North Loop Avenue' },
    });
    fireEvent.change(screen.getByLabelText('Appointment date'), {
      target: { value: '2099-04-10' },
    });
    fireEvent.change(screen.getByLabelText('Appointment time'), {
      target: { value: '09:30' },
    });

    const submitButton = screen.getByRole('button', { name: 'Create booking' });

    expectFocusable(submitButton);
    fireEvent.click(submitButton);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Booking created successfully with Pending status.',
    );

    cleanup();
    storeBookings([
      createBooking({
        id: 'booking-cancellable',
        serviceId: 'appliance-repair',
        serviceName: 'Appliance repair',
        status: 'Confirmed',
      }),
    ]);
    renderWithProviders(<MyBookingsPage />);

    const cancelButton = await screen.findByRole('button', {
      name: 'Cancel Appliance repair booking',
    });

    expectFocusable(cancelButton);
    fireEvent.click(cancelButton);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Appliance repair booking cancelled.',
    );

    cleanup();
    storeBookings([
      createBooking({
        id: 'booking-status-update',
        status: 'Pending',
      }),
    ]);
    renderWithProviders(<AdminDashboard />, null);

    const statusSelect = await screen.findByLabelText(
      'Update status for Alex Rivera',
    );

    expectFocusable(statusSelect);
    fireEvent.change(statusSelect, {
      target: { value: 'Completed' },
    });

    expect(screen.getByRole('status')).toHaveTextContent(
      'Plumbing booking set to Completed.',
    );
  });

  it('maintains semantic heading order on customer and admin screens', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expectCurrentHeadingsToBeOrdered();

    cleanup();
    storeBookings([]);
    renderWithProviders(<BookingPage />);
    expectCurrentHeadingsToBeOrdered();

    cleanup();
    storeBookings([createBooking()]);
    renderWithProviders(<MyBookingsPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Plumbing' }),
      ).toBeInTheDocument();
    });
    expectCurrentHeadingsToBeOrdered();

    cleanup();
    storeBookings([createBooking()]);
    renderWithProviders(<AdminDashboard />, null);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Admin Dashboard' }),
      ).toBeInTheDocument();
    });
    expectCurrentHeadingsToBeOrdered();
  });
});

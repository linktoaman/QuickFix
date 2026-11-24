import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import BookingCard from '../BookingCard';
import type { Booking, BookingStatus } from '../../types/booking';

function createBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-card-test-id',
    customerId: 'customer-alex-rivera',
    serviceId: 'electrical',
    serviceName: 'Electrical',
    customerName: 'Alex Rivera',
    phone: '+1 555-010-0123',
    address: '123 Maple Street',
    appointmentDate: '2099-05-15',
    appointmentTime: '10:30',
    description: 'Kitchen outlet loses power intermittently.',
    status: 'Pending',
    createdAt: '2026-01-01T12:00:00.000Z',
    updatedAt: '2026-01-01T12:00:00.000Z',
    ...overrides,
  };
}

describe('BookingCard', () => {
  it('renders booking details and the status badge', () => {
    render(<BookingCard booking={createBooking({ status: 'Confirmed' })} />);

    expect(screen.getByRole('heading', { name: 'Electrical' })).toBeInTheDocument();
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText('+1 555-010-0123')).toBeInTheDocument();
    expect(screen.getByText('123 Maple Street')).toBeInTheDocument();
    expect(
      screen.getByText('Kitchen outlet loses power intermittently.'),
    ).toBeInTheDocument();

    const appointmentDetail = screen.getByText('Date and time').closest('div');

    if (appointmentDetail === null) {
      throw new Error('Missing appointment detail group.');
    }

    expect(appointmentDetail).toHaveTextContent('2099');
    expect(appointmentDetail).toHaveTextContent('10:30');
  });

  it.each<BookingStatus>(['Pending', 'Confirmed'])(
    'shows a cancellation button for %s bookings',
    (status) => {
      const onCancel = vi.fn();

      render(<BookingCard booking={createBooking({ status })} onCancel={onCancel} />);

      fireEvent.click(screen.getByRole('button', {
        name: 'Cancel Electrical booking',
      }));

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onCancel).toHaveBeenCalledWith('booking-card-test-id');
    },
  );

  it.each<{
    status: BookingStatus;
    hint: string;
  }>([
    {
      status: 'Completed',
      hint: 'Completed bookings are closed and cannot be cancelled.',
    },
    {
      status: 'Cancelled',
      hint: 'This booking has already been cancelled.',
    },
  ])('hides cancellation actions for $status bookings', ({ status, hint }) => {
    render(
      <BookingCard
        booking={createBooking({ status })}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', {
      name: 'Cancel Electrical booking',
    })).not.toBeInTheDocument();
    expect(screen.getByText(hint)).toBeInTheDocument();
  });

  it('hides cancellation actions when no cancellation handler is provided', () => {
    render(<BookingCard booking={createBooking()} />);

    expect(screen.queryByRole('button', {
      name: 'Cancel Electrical booking',
    })).not.toBeInTheDocument();
  });
});

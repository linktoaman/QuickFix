import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import BookingForm from '../BookingForm';
import {
  BookingContext,
  type CreateBookingResult,
} from '../../../state/bookingContext';
import type { Booking, BookingFormInput } from '../../../types/booking';

const createdBooking: Booking = {
  id: 'booking-form-test-id',
  customerId: 'customer-alex-rivera',
  serviceId: 'plumbing',
  serviceName: 'Plumbing',
  customerName: 'Alex Rivera',
  phone: '+1 555-010-0123',
  address: '123 Maple Street',
  appointmentDate: '2099-03-10',
  appointmentTime: '09:30',
  status: 'Pending',
  createdAt: '2026-01-01T12:00:00.000Z',
  updatedAt: '2026-01-01T12:00:00.000Z',
};

function renderBookingForm(
  createBooking = vi.fn<(_: BookingFormInput) => CreateBookingResult>(() => ({
    ok: true,
    booking: createdBooking,
  })),
) {
  render(
    <BookingContext.Provider
      value={{
        bookings: [],
        storageError: null,
        createBooking,
        getBookingsForCustomer: vi.fn(() => []),
      }}
    >
      <BookingForm />
    </BookingContext.Provider>,
  );

  return { createBooking };
}

function fillValidBookingForm() {
  fireEvent.change(screen.getByLabelText('Service'), {
    target: { value: 'plumbing' },
  });
  fireEvent.change(screen.getByLabelText('Customer name'), {
    target: { value: 'Alex Rivera' },
  });
  fireEvent.change(screen.getByLabelText('Phone'), {
    target: { value: '+1 555-010-0123' },
  });
  fireEvent.change(screen.getByLabelText('Address'), {
    target: { value: '123 Maple Street' },
  });
  fireEvent.change(screen.getByLabelText('Appointment date'), {
    target: { value: '2099-03-10' },
  });
  fireEvent.change(screen.getByLabelText('Appointment time'), {
    target: { value: '09:30' },
  });
}

describe('BookingForm', () => {
  it('shows validation messages and does not submit an invalid booking', () => {
    const createBooking = vi.fn<(_: BookingFormInput) => CreateBookingResult>();

    renderBookingForm(createBooking);

    fireEvent.click(screen.getByRole('button', { name: 'Create booking' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please complete the required booking details.',
    );
    expect(screen.getByText('Choose a service.')).toBeInTheDocument();
    expect(screen.getByText('Enter your name.')).toBeInTheDocument();
    expect(screen.getByText('Enter your phone number.')).toBeInTheDocument();
    expect(screen.getByText('Enter the service address.')).toBeInTheDocument();
    expect(screen.getByText('Choose an appointment date.')).toBeInTheDocument();
    expect(screen.getByText('Choose an appointment time.')).toBeInTheDocument();
    expect(createBooking).not.toHaveBeenCalled();
  });

  it('shows a success message for a valid booking submission', () => {
    const { createBooking } = renderBookingForm();

    fillValidBookingForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create booking' }));

    expect(screen.getByRole('status')).toHaveTextContent(
      'Booking created successfully with Pending status.',
    );
    expect(createBooking).toHaveBeenCalledWith({
      service: 'plumbing',
      name: 'Alex Rivera',
      phone: '+1 555-010-0123',
      address: '123 Maple Street',
      date: '2099-03-10',
      time: '09:30',
      description: '',
    });
  });
});

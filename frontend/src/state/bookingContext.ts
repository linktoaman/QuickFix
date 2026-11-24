import { createContext } from 'react';

import type { BookingStatusCounts } from '../domain/booking';
import type { Booking, BookingFormInput } from '../types/booking';

export type CreateBookingResult = {
  ok: true;
  booking: Booking;
} | {
  ok: false;
  error: string;
};

export type CancelBookingResult = {
  ok: true;
  booking: Booking;
} | {
  ok: false;
  error: string;
};

export type UpdateBookingStatusResult = {
  ok: true;
  booking: Booking;
} | {
  ok: false;
  error: string;
};

export type BookingContextValue = {
  bookings: Booking[];
  storageError: string | null;
  createBooking: (input: BookingFormInput) => CreateBookingResult;
  cancelBooking: (bookingId: string, customerId: string) => CancelBookingResult;
  updateBookingStatus: (
    bookingId: string,
    status: string,
  ) => UpdateBookingStatusResult;
  getAllBookings: () => Booking[];
  getBookingsForCustomer: (customerId: string) => Booking[];
  getStatusCounts: () => BookingStatusCounts;
};

export const BookingContext = createContext<BookingContextValue | null>(null);

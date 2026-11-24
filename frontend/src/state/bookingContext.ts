import { createContext } from 'react';

import type { Booking, BookingFormInput } from '../types/booking';

export type CreateBookingResult = {
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
  getBookingsForCustomer: (customerId: string) => Booking[];
};

export const BookingContext = createContext<BookingContextValue | null>(null);

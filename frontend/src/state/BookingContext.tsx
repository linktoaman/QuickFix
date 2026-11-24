import { useEffect, useState, type ReactNode } from 'react';

import { createBooking as createBookingRecord } from '../domain/booking';
import { validateBookingInput } from '../domain/validation';
import useRole from '../hooks/useRole';
import {
  readStoredBookings,
  writeStoredBookings,
} from '../storage/localStorageAdapter';
import type { Booking, BookingFormInput } from '../types/booking';
import { BookingContext, type BookingContextValue, type CreateBookingResult } from './bookingContext';

type BookingProviderProps = {
  children: ReactNode;
};

const BOOKING_CREATE_ERROR = 'We could not save this booking. Please try again.';
const CUSTOMER_REQUIRED_ERROR = 'Choose a customer before booking a service.';
const VALIDATION_ERROR = 'Please fix the highlighted booking details.';

export function BookingProvider({ children }: BookingProviderProps) {
  const { selectedCustomerId } = useRole();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    const storedBookings = readStoredBookings();

    if (!storedBookings.ok) {
      setStorageError(storedBookings.error);
      return;
    }

    setBookings(storedBookings.value);
    setStorageError(null);
  }, []);

  function createBooking(input: BookingFormInput): CreateBookingResult {
    if (selectedCustomerId === null) {
      return {
        ok: false,
        error: CUSTOMER_REQUIRED_ERROR,
      };
    }

    if (validateBookingInput(input).length > 0) {
      return {
        ok: false,
        error: VALIDATION_ERROR,
      };
    }

    const createdAt = new Date().toISOString();
    const booking = createBookingRecord({
      ...input,
      id: createBookingId(),
      customerId: selectedCustomerId,
      createdAt,
    });
    const currentBookings = readStoredBookings();

    if (!currentBookings.ok) {
      setStorageError(currentBookings.error);

      return {
        ok: false,
        error: BOOKING_CREATE_ERROR,
      };
    }

    const nextBookings = [...currentBookings.value, booking];
    const storageResult = writeStoredBookings(nextBookings);

    if (!storageResult.ok) {
      setStorageError(storageResult.error);

      return {
        ok: false,
        error: BOOKING_CREATE_ERROR,
      };
    }

    setBookings(storageResult.value);
    setStorageError(null);

    return {
      ok: true,
      booking,
    };
  }

  function getBookingsForCustomer(customerId: string) {
    return bookings.filter((booking) => booking.customerId === customerId);
  }

  const contextValue: BookingContextValue = {
    bookings,
    storageError,
    createBooking,
    getBookingsForCustomer,
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
}

function createBookingId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `booking-${crypto.randomUUID()}`;
  }

  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).slice(2);

  return `booking-${timestamp}-${randomSuffix}`;
}

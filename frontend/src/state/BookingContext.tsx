import { useEffect, useState, type ReactNode } from 'react';

import {
  canCustomerCancel,
  createBooking as createBookingRecord,
  getStatusCounts as getBookingStatusCounts,
  isBookingStatus,
} from '../domain/booking';
import { validateBookingInput } from '../domain/validation';
import useRole from '../hooks/useRole';
import {
  readStoredBookings,
  writeStoredBookings,
} from '../storage/localStorageAdapter';
import type { Booking, BookingFormInput } from '../types/booking';
import {
  BookingContext,
  type BookingContextValue,
  type CancelBookingResult,
  type CreateBookingResult,
  type UpdateBookingStatusResult,
} from './bookingContext';

type BookingProviderProps = {
  children: ReactNode;
};

const BOOKING_CREATE_ERROR = 'We could not save this booking. Please try again.';
const BOOKING_CANCEL_ERROR = 'We could not cancel this booking. Please try again.';
const BOOKING_CANCEL_NOT_ALLOWED_ERROR = 'This booking cannot be cancelled.';
const BOOKING_STATUS_UPDATE_ERROR = 'We could not update this booking status.';
const BOOKING_STATUS_NOT_ALLOWED_ERROR = 'Choose a valid booking status.';
const BOOKING_STATUS_NOT_FOUND_ERROR = 'We could not find that booking.';
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

  function cancelBooking(
    bookingId: string,
    customerId: string,
  ): CancelBookingResult {
    const currentBookings = readStoredBookings();

    if (!currentBookings.ok) {
      setStorageError(currentBookings.error);

      return {
        ok: false,
        error: BOOKING_CANCEL_ERROR,
      };
    }

    const bookingToCancel = currentBookings.value.find(
      (booking) => booking.id === bookingId,
    );

    if (
      bookingToCancel === undefined
      || bookingToCancel.customerId !== customerId
      || !canCustomerCancel(bookingToCancel.status)
    ) {
      return {
        ok: false,
        error: BOOKING_CANCEL_NOT_ALLOWED_ERROR,
      };
    }

    const cancelledBooking: Booking = {
      ...bookingToCancel,
      status: 'Cancelled',
      updatedAt: new Date().toISOString(),
    };
    const nextBookings = currentBookings.value.map((booking) => (
      booking.id === bookingId ? cancelledBooking : booking
    ));
    const storageResult = writeStoredBookings(nextBookings);

    if (!storageResult.ok) {
      setStorageError(storageResult.error);

      return {
        ok: false,
        error: BOOKING_CANCEL_ERROR,
      };
    }

    setBookings(storageResult.value);
    setStorageError(null);

    return {
      ok: true,
      booking: cancelledBooking,
    };
  }

  function updateBookingStatus(
    bookingId: string,
    status: string,
  ): UpdateBookingStatusResult {
    if (!isBookingStatus(status)) {
      return {
        ok: false,
        error: BOOKING_STATUS_NOT_ALLOWED_ERROR,
      };
    }

    const currentBookings = readStoredBookings();

    if (!currentBookings.ok) {
      setStorageError(currentBookings.error);

      return {
        ok: false,
        error: BOOKING_STATUS_UPDATE_ERROR,
      };
    }

    const bookingToUpdate = currentBookings.value.find(
      (booking) => booking.id === bookingId,
    );

    if (bookingToUpdate === undefined) {
      return {
        ok: false,
        error: BOOKING_STATUS_NOT_FOUND_ERROR,
      };
    }

    const updatedBooking: Booking = {
      ...bookingToUpdate,
      status,
      updatedAt: new Date().toISOString(),
    };
    const nextBookings = currentBookings.value.map((booking) => (
      booking.id === bookingId ? updatedBooking : booking
    ));
    const storageResult = writeStoredBookings(nextBookings);

    if (!storageResult.ok) {
      setStorageError(storageResult.error);

      return {
        ok: false,
        error: BOOKING_STATUS_UPDATE_ERROR,
      };
    }

    setBookings(storageResult.value);
    setStorageError(null);

    return {
      ok: true,
      booking: updatedBooking,
    };
  }

  function getAllBookings(): Booking[] {
    return [...bookings];
  }

  function getBookingsForCustomer(customerId: string): Booking[] {
    return bookings.filter((booking) => booking.customerId === customerId);
  }

  function getStatusCounts() {
    return getBookingStatusCounts(bookings);
  }

  const contextValue: BookingContextValue = {
    bookings,
    storageError,
    createBooking,
    cancelBooking,
    updateBookingStatus,
    getAllBookings,
    getBookingsForCustomer,
    getStatusCounts,
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

import { useEffect, useState, type ReactNode } from 'react';

import {
  canCustomerCancel,
  createBooking as createBookingRecord,
  getStatusCounts as getBookingStatusCounts,
  isBookingStatus,
} from '../domain/booking';
import { createSeedBookings } from '../data/seedBookings';
import { validateBookingInput } from '../domain/validation';
import useRole from '../hooks/useRole';
import {
  hasBookingData,
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

type BookingMutationResult<T> = {
  ok: true;
  value: T;
} | {
  ok: false;
  error: string;
  cause: 'operation' | 'storage';
};

type BookingMutation<T> = {
  ok: true;
  bookings: Booking[];
  value: T;
} | {
  ok: false;
  error: string;
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
    const bookingDataPresence = hasBookingData();

    if (!bookingDataPresence.ok) {
      setStorageError(bookingDataPresence.error.message);
      return;
    }

    if (!bookingDataPresence.value) {
      const seedResult = writeStoredBookings(createSeedBookings());

      if (!seedResult.ok) {
        setStorageError(seedResult.error);
        return;
      }

      setBookings(seedResult.value);
      setStorageError(null);
      return;
    }

    const storedBookings = readStoredBookings();

    if (!storedBookings.ok) {
      setStorageError(storedBookings.error);
      return;
    }

    setBookings(storedBookings.value);
    setStorageError(null);
  }, []);

  function persistBookingMutation<T>(
    mutateBookings: (currentBookings: Booking[]) => BookingMutation<T>,
  ): BookingMutationResult<T> {
    const currentBookings = readStoredBookings();

    if (!currentBookings.ok) {
      setStorageError(currentBookings.error);

      return {
        ok: false,
        error: currentBookings.error,
        cause: 'storage',
      };
    }

    const mutation = mutateBookings(dedupeBookingsById(currentBookings.value));

    if (!mutation.ok) {
      setStorageError(null);

      return {
        ok: false,
        error: mutation.error,
        cause: 'operation',
      };
    }

    const storageResult = writeStoredBookings(mutation.bookings);

    if (!storageResult.ok) {
      setStorageError(storageResult.error);

      return {
        ok: false,
        error: storageResult.error,
        cause: 'storage',
      };
    }

    const persistedBookings = dedupeBookingsById(storageResult.value);

    setBookings(persistedBookings);
    setStorageError(null);

    return {
      ok: true,
      value: mutation.value,
    };
  }

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
    const mutationResult = persistBookingMutation((currentBookings) => ({
      ok: true,
      bookings: upsertBookingById(currentBookings, booking),
      value: booking,
    }));

    if (!mutationResult.ok) {
      return {
        ok: false,
        error: BOOKING_CREATE_ERROR,
      };
    }

    return {
      ok: true,
      booking: mutationResult.value,
    };
  }

  function cancelBooking(
    bookingId: string,
    customerId: string,
  ): CancelBookingResult {
    const updatedAt = new Date().toISOString();
    const mutationResult = persistBookingMutation((currentBookings) => {
      const storedBooking = currentBookings.find(
        (booking) => booking.id === bookingId,
      );

      if (
        storedBooking === undefined
        || storedBooking.customerId !== customerId
        || !canCustomerCancel(storedBooking.status)
      ) {
        return {
          ok: false,
          error: BOOKING_CANCEL_NOT_ALLOWED_ERROR,
        };
      }

      const cancelledBooking: Booking = {
        ...storedBooking,
        status: 'Cancelled',
        updatedAt,
      };

      return {
        ok: true,
        bookings: upsertBookingById(currentBookings, cancelledBooking),
        value: cancelledBooking,
      };
    });

    if (!mutationResult.ok) {
      return {
        ok: false,
        error: mutationResult.cause === 'storage'
          ? BOOKING_CANCEL_ERROR
          : mutationResult.error,
      };
    }

    return {
      ok: true,
      booking: mutationResult.value,
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

    const updatedAt = new Date().toISOString();
    const mutationResult = persistBookingMutation((currentBookings) => {
      const storedBooking = currentBookings.find(
        (booking) => booking.id === bookingId,
      );

      if (storedBooking === undefined) {
        return {
          ok: false,
          error: BOOKING_STATUS_NOT_FOUND_ERROR,
        };
      }

      const updatedBooking: Booking = {
        ...storedBooking,
        status,
        updatedAt,
      };

      return {
        ok: true,
        bookings: upsertBookingById(currentBookings, updatedBooking),
        value: updatedBooking,
      };
    });

    if (!mutationResult.ok) {
      return {
        ok: false,
        error: mutationResult.cause === 'storage'
          ? BOOKING_STATUS_UPDATE_ERROR
          : mutationResult.error,
      };
    }

    return {
      ok: true,
      booking: mutationResult.value,
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

function upsertBookingById(
  bookings: readonly Booking[],
  nextBooking: Booking,
): Booking[] {
  const bookingWasReplaced = bookings.some(
    (booking) => booking.id === nextBooking.id,
  );
  const nextBookings = bookings.map((booking) => (
    booking.id === nextBooking.id ? nextBooking : booking
  ));

  return bookingWasReplaced
    ? nextBookings
    : [...nextBookings, nextBooking];
}

function dedupeBookingsById(bookings: readonly Booking[]): Booking[] {
  return bookings.reduce<Booking[]>((uniqueBookings, booking) => (
    upsertBookingById(uniqueBookings, booking)
  ), []);
}

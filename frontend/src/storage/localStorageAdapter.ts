import { isMockCustomerId } from '../data/mockCustomers';
import { isServiceId } from '../domain/booking';
import type { Booking, BookingStatus } from '../types/booking';

export const QUICKFIX_BOOKINGS_STORAGE_KEY = 'localStorage.quickfix.bookings.v1';

export type StorageResult<T> = {
  ok: true;
  value: T;
} | {
  ok: false;
  error: string;
};

type StoredBookingsPayload = {
  bookings?: unknown;
};

const BOOKING_STATUSES: readonly BookingStatus[] = [
  'Pending',
  'Confirmed',
  'Completed',
  'Cancelled',
];

const STORAGE_ERROR_MESSAGE = 'Booking storage is unavailable. Please try again.';

export function readStoredBookings(): StorageResult<Booking[]> {
  if (typeof window === 'undefined') {
    return {
      ok: true,
      value: [],
    };
  }

  try {
    const storedValue = window.localStorage.getItem(
      QUICKFIX_BOOKINGS_STORAGE_KEY,
    );

    if (storedValue === null) {
      return {
        ok: true,
        value: [],
      };
    }

    return {
      ok: true,
      value: normalizeStoredBookings(JSON.parse(storedValue)),
    };
  } catch {
    return {
      ok: false,
      error: STORAGE_ERROR_MESSAGE,
    };
  }
}

export function writeStoredBookings(bookings: Booking[]): StorageResult<Booking[]> {
  if (typeof window === 'undefined') {
    return {
      ok: false,
      error: STORAGE_ERROR_MESSAGE,
    };
  }

  try {
    window.localStorage.setItem(
      QUICKFIX_BOOKINGS_STORAGE_KEY,
      JSON.stringify({ bookings }),
    );

    return {
      ok: true,
      value: bookings,
    };
  } catch {
    return {
      ok: false,
      error: STORAGE_ERROR_MESSAGE,
    };
  }
}

function normalizeStoredBookings(value: unknown): Booking[] {
  const possibleBookings = Array.isArray(value)
    ? value
    : getPayloadBookings(value);

  return possibleBookings
    .map((booking) => normalizeStoredBooking(booking))
    .filter((booking): booking is Booking => booking !== null);
}

function getPayloadBookings(value: unknown): unknown[] {
  if (value === null || typeof value !== 'object') {
    return [];
  }

  const payload = value as StoredBookingsPayload;

  return Array.isArray(payload.bookings) ? payload.bookings : [];
}

function normalizeStoredBooking(value: unknown): Booking | null {
  if (value === null || typeof value !== 'object') {
    return null;
  }

  const booking = value as Record<string, unknown>;
  const description = getOptionalString(booking.description);

  if (
    !isNonEmptyString(booking.id)
    || !isMockCustomerId(booking.customerId)
    || !isNonEmptyString(booking.serviceId)
    || !isServiceId(booking.serviceId)
    || !isNonEmptyString(booking.serviceName)
    || !isNonEmptyString(booking.customerName)
    || !isNonEmptyString(booking.phone)
    || !isNonEmptyString(booking.address)
    || !isNonEmptyString(booking.appointmentDate)
    || !isNonEmptyString(booking.appointmentTime)
    || !isBookingStatus(booking.status)
    || !isNonEmptyString(booking.createdAt)
    || !isNonEmptyString(booking.updatedAt)
  ) {
    return null;
  }

  return {
    id: booking.id.trim(),
    customerId: booking.customerId,
    serviceId: booking.serviceId,
    serviceName: booking.serviceName.trim(),
    customerName: booking.customerName.trim(),
    phone: booking.phone.trim(),
    address: booking.address.trim(),
    appointmentDate: booking.appointmentDate.trim(),
    appointmentTime: booking.appointmentTime.trim(),
    ...(description !== null ? { description } : {}),
    status: booking.status,
    createdAt: booking.createdAt.trim(),
    updatedAt: booking.updatedAt.trim(),
  };
}

function isBookingStatus(value: unknown): value is BookingStatus {
  return typeof value === 'string'
    && BOOKING_STATUSES.includes(value as BookingStatus);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function getOptionalString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue === '' ? null : trimmedValue;
}

import { isMockCustomerId } from '../data/mockCustomers';
import { isBookingStatus, isServiceId } from '../domain/booking';
import type { Booking } from '../types/booking';

export const QUICKFIX_BOOKINGS_STORAGE_KEY = 'localStorage.quickfix.bookings.v1';

const SCHEMA_VERSION = 1;
const STORAGE_ERROR_MESSAGE = 'Booking storage is unavailable. Please try again.';

export type BookingStorageErrorCode =
  | 'storage-unavailable'
  | 'read-failed'
  | 'parse-failed'
  | 'invalid-payload'
  | 'write-failed'
  | 'quota-exceeded';

export type BookingStorageError = {
  code: BookingStorageErrorCode;
  message: string;
};

export type StorageResult<T> = {
  ok: true;
  value: T;
} | {
  ok: false;
  error: BookingStorageError;
};

export type StoredBookingsV1Payload = {
  schemaVersion: typeof SCHEMA_VERSION;
  bookings: Record<string, Booking>;
};

type LegacyStorageResult<T> = {
  ok: true;
  value: T;
} | {
  ok: false;
  error: string;
};

type StoredBookingsPayloadCandidate = {
  schemaVersion?: unknown;
  bookings?: unknown;
};

export function readBookings(): StorageResult<Booking[]> {
  const storageResult = getLocalStorage();

  if (!storageResult.ok) {
    return storageResult;
  }

  let storedValue: string | null;

  try {
    storedValue = storageResult.value.getItem(QUICKFIX_BOOKINGS_STORAGE_KEY);
  } catch {
    return errorResult('read-failed');
  }

  if (storedValue === null) {
    return {
      ok: true,
      value: [],
    };
  }

  const parsedPayload = safeParseBookingPayload(storedValue);

  if (!parsedPayload.ok) {
    return parsedPayload;
  }

  return {
    ok: true,
    value: bookingsByIdToList(parsedPayload.value.bookings),
  };
}

export function writeBookings(bookings: readonly Booking[]): StorageResult<Booking[]> {
  const storageResult = getLocalStorage();

  if (!storageResult.ok) {
    return storageResult;
  }

  const normalizedBookings = normalizeBookingList(bookings);
  const payload: StoredBookingsV1Payload = {
    schemaVersion: SCHEMA_VERSION,
    bookings: bookingsToBookingsById(normalizedBookings),
  };

  try {
    storageResult.value.setItem(
      QUICKFIX_BOOKINGS_STORAGE_KEY,
      JSON.stringify(payload),
    );
  } catch (error) {
    return errorResult(isQuotaExceededError(error) ? 'quota-exceeded' : 'write-failed');
  }

  return {
    ok: true,
    value: normalizedBookings,
  };
}

export function hasBookingData(): StorageResult<boolean> {
  const storageResult = getLocalStorage();

  if (!storageResult.ok) {
    return storageResult;
  }

  try {
    return {
      ok: true,
      value: storageResult.value.getItem(QUICKFIX_BOOKINGS_STORAGE_KEY) !== null,
    };
  } catch {
    return errorResult('read-failed');
  }
}

export function safeParseBookingPayload(
  serializedValue: string,
): StorageResult<StoredBookingsV1Payload> {
  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(serializedValue);
  } catch {
    return errorResult('parse-failed');
  }

  return normalizeStoredBookingsPayload(parsedValue);
}

export function readStoredBookings(): LegacyStorageResult<Booking[]> {
  return toLegacyResult(readBookings());
}

export function writeStoredBookings(
  bookings: readonly Booking[],
): LegacyStorageResult<Booking[]> {
  return toLegacyResult(writeBookings(bookings));
}

function getLocalStorage(): StorageResult<Storage> {
  if (typeof window === 'undefined') {
    return errorResult('storage-unavailable');
  }

  try {
    return {
      ok: true,
      value: window.localStorage,
    };
  } catch {
    return errorResult('storage-unavailable');
  }
}

function normalizeStoredBookingsPayload(
  value: unknown,
): StorageResult<StoredBookingsV1Payload> {
  if (value === null || typeof value !== 'object') {
    return errorResult('invalid-payload');
  }

  const payload = value as StoredBookingsPayloadCandidate;

  if (payload.schemaVersion === undefined) {
    return normalizeLegacyBookingsPayload(value);
  }

  if (payload.schemaVersion !== SCHEMA_VERSION) {
    return errorResult('invalid-payload');
  }

  if (payload.bookings === null || typeof payload.bookings !== 'object') {
    return errorResult('invalid-payload');
  }

  if (Array.isArray(payload.bookings)) {
    return errorResult('invalid-payload');
  }

  const normalizedBookings = normalizeBookingsById(payload.bookings);

  if (normalizedBookings === null) {
    return errorResult('invalid-payload');
  }

  return {
    ok: true,
    value: {
      schemaVersion: SCHEMA_VERSION,
      bookings: normalizedBookings,
    },
  };
}

function normalizeLegacyBookingsPayload(
  value: object,
): StorageResult<StoredBookingsV1Payload> {
  const bookings = Array.isArray(value)
    ? value
    : getLegacyPayloadBookings(value);

  if (bookings === null) {
    return errorResult('invalid-payload');
  }

  const normalizedBookings = normalizeBookingList(bookings);

  return {
    ok: true,
    value: {
      schemaVersion: SCHEMA_VERSION,
      bookings: bookingsToBookingsById(normalizedBookings),
    },
  };
}

function getLegacyPayloadBookings(value: object): unknown[] | null {
  const payload = value as StoredBookingsPayloadCandidate;

  return Array.isArray(payload.bookings) ? payload.bookings : null;
}

function normalizeBookingsById(value: object): Record<string, Booking> | null {
  return Object.entries(value).reduce<Record<string, Booking> | null>(
    (normalizedBookings, [bookingId, bookingValue]) => {
      if (normalizedBookings === null) {
        return null;
      }

      const normalizedBooking = normalizeBooking(bookingValue);

      if (normalizedBooking === null || normalizedBooking.id !== bookingId) {
        return null;
      }

      return {
        ...normalizedBookings,
        [normalizedBooking.id]: normalizedBooking,
      };
    },
    {},
  );
}

function normalizeBookingList(bookings: readonly Booking[]): Booking[] {
  return bookings.reduce<Booking[]>((normalizedBookings, booking) => {
    const normalizedBooking = normalizeBooking(booking);

    if (normalizedBooking === null) {
      return normalizedBookings;
    }

    return [...normalizedBookings, normalizedBooking];
  }, []);
}

function bookingsToBookingsById(bookings: readonly Booking[]): Record<string, Booking> {
  return bookings.reduce<Record<string, Booking>>((bookingsById, booking) => ({
    ...bookingsById,
    [booking.id]: booking,
  }), {});
}

function bookingsByIdToList(bookingsById: Record<string, Booking>): Booking[] {
  return Object.values(bookingsById);
}

function normalizeBooking(value: unknown): Booking | null {
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

function toLegacyResult<T>(result: StorageResult<T>): LegacyStorageResult<T> {
  if (result.ok) {
    return result;
  }

  return {
    ok: false,
    error: result.error.message,
  };
}

function errorResult<T>(code: BookingStorageErrorCode): StorageResult<T> {
  return {
    ok: false,
    error: {
      code,
      message: STORAGE_ERROR_MESSAGE,
    },
  };
}

function isQuotaExceededError(error: unknown): boolean {
  return typeof DOMException !== 'undefined'
    && error instanceof DOMException
    && (
      error.name === 'QuotaExceededError'
      || error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      || error.code === 22
      || error.code === 1014
    );
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

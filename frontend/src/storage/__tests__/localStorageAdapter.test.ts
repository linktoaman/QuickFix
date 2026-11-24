import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  hasBookingData,
  QUICKFIX_BOOKINGS_STORAGE_KEY,
  readBookings,
  safeParseBookingPayload,
  writeBookings,
} from '../localStorageAdapter';
import type { Booking } from '../../types/booking';

function createStoredBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-storage-test',
    customerId: 'customer-alex-rivera',
    serviceId: 'plumbing',
    serviceName: 'Plumbing',
    customerName: 'Alex Rivera',
    phone: '+1 555-010-0142',
    address: '214 North Loop Avenue',
    appointmentDate: '2099-02-20',
    appointmentTime: '09:30',
    description: 'Kitchen sink drain is running slowly.',
    status: 'Pending',
    createdAt: '2026-01-01T12:00:00.000Z',
    updatedAt: '2026-01-01T12:00:00.000Z',
    ...overrides,
  };
}

function readRawStoredPayload() {
  const storedValue = window.localStorage.getItem(QUICKFIX_BOOKINGS_STORAGE_KEY);

  return JSON.parse(storedValue ?? '{}') as {
    schemaVersion?: number;
    bookings?: Record<string, Booking>;
  };
}

describe('localStorageAdapter', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('XMLHttpRequest', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports absent booking data without seeding or transmitting data', () => {
    const dataPresence = hasBookingData();
    const bookings = readBookings();

    expect(dataPresence).toEqual({
      ok: true,
      value: false,
    });
    expect(bookings).toEqual({
      ok: true,
      value: [],
    });
    expect(window.localStorage.getItem(QUICKFIX_BOOKINGS_STORAGE_KEY)).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
    expect(XMLHttpRequest).not.toHaveBeenCalled();
  });

  it('writes the v1 browser-only payload and reads it back from localStorage', () => {
    const booking = createStoredBooking();

    const writeResult = writeBookings([booking]);
    const readResult = readBookings();
    const storedPayload = readRawStoredPayload();

    expect(writeResult).toEqual({
      ok: true,
      value: [booking],
    });
    expect(readResult).toEqual({
      ok: true,
      value: [booking],
    });
    expect(storedPayload).toEqual({
      schemaVersion: 1,
      bookings: {
        [booking.id]: booking,
      },
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(XMLHttpRequest).not.toHaveBeenCalled();
  });

  it('returns parse failures without replacing the broken localStorage value', () => {
    window.localStorage.setItem(QUICKFIX_BOOKINGS_STORAGE_KEY, '{not-json');

    const readResult = readBookings();

    expect(readResult).toEqual({
      ok: false,
      error: {
        code: 'parse-failed',
        message: 'Booking storage is unavailable. Please try again.',
      },
    });
    expect(window.localStorage.getItem(QUICKFIX_BOOKINGS_STORAGE_KEY)).toBe('{not-json');
    expect(fetch).not.toHaveBeenCalled();
    expect(XMLHttpRequest).not.toHaveBeenCalled();
  });

  it('parses legacy booking arrays without requiring a network migration', () => {
    const legacyBooking = createStoredBooking({
      id: 'booking-legacy-storage-test',
    });

    const parseResult = safeParseBookingPayload(JSON.stringify([legacyBooking]));

    expect(parseResult).toEqual({
      ok: true,
      value: {
        schemaVersion: 1,
        bookings: {
          [legacyBooking.id]: legacyBooking,
        },
      },
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(XMLHttpRequest).not.toHaveBeenCalled();
  });
});

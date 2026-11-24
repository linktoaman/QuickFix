import { describe, expect, it } from 'vitest';

import { canCustomerCancel } from '../booking';
import type { BookingStatus } from '../../types/booking';

describe('booking cancellation eligibility', () => {
  it.each<{
    status: BookingStatus;
    expected: boolean;
  }>([
    { status: 'Pending', expected: true },
    { status: 'Confirmed', expected: true },
    { status: 'Completed', expected: false },
    { status: 'Cancelled', expected: false },
  ])('returns $expected for $status bookings', ({ status, expected }) => {
    expect(canCustomerCancel(status)).toBe(expected);
  });
});

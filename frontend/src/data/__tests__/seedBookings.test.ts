import { afterEach, describe, expect, it, vi } from 'vitest';

import { BOOKING_STATUSES, SERVICE_CATALOG } from '../../domain/booking';
import { createSeedBookings } from '../seedBookings';

describe('createSeedBookings', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('creates stable demo booking identities with dates relative to today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-24T08:00:00.000Z'));

    const seedBookings = createSeedBookings();

    expect(seedBookings).toEqual([
      expect.objectContaining({
        id: 'seed-booking-alex-pending-plumbing',
        customerId: 'customer-alex-rivera',
        serviceId: 'plumbing',
        appointmentDate: '2026-11-26',
        status: 'Pending',
      }),
      expect.objectContaining({
        id: 'seed-booking-maya-confirmed-electrical',
        customerId: 'customer-maya-patel',
        serviceId: 'electrical',
        appointmentDate: '2026-11-29',
        status: 'Confirmed',
      }),
      expect.objectContaining({
        id: 'seed-booking-alex-completed-appliance',
        customerId: 'customer-alex-rivera',
        serviceId: 'appliance-repair',
        appointmentDate: '2026-11-17',
        status: 'Completed',
      }),
    ]);
    expect(seedBookings).toHaveLength(3);
  });

  it('uses only known services and statuses without invoking network APIs', () => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('XMLHttpRequest', vi.fn());

    const serviceIds = SERVICE_CATALOG.map((service) => service.id);

    createSeedBookings().forEach((booking) => {
      expect(serviceIds).toContain(booking.serviceId);
      expect(BOOKING_STATUSES).toContain(booking.status);
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(XMLHttpRequest).not.toHaveBeenCalled();
  });
});

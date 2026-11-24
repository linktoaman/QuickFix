import type { Booking } from '../types/booking';

const DATE_OFFSET_MS = 24 * 60 * 60 * 1000;

function getRelativeDate(daysFromToday: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);

  return date.toISOString().slice(0, 10);
}

function getRelativeTimestamp(daysFromToday: number): string {
  return new Date(Date.now() + (daysFromToday * DATE_OFFSET_MS)).toISOString();
}

export function createSeedBookings(): Booking[] {
  const alexCreatedAt = getRelativeTimestamp(-3);
  const mayaCreatedAt = getRelativeTimestamp(-2);
  const completedCreatedAt = getRelativeTimestamp(-18);

  return [
    {
      id: 'seed-booking-alex-pending-plumbing',
      customerId: 'customer-alex-rivera',
      serviceId: 'plumbing',
      serviceName: 'Plumbing',
      customerName: 'Alex Rivera',
      phone: '+1 555-010-0142',
      address: '214 North Loop Avenue',
      appointmentDate: getRelativeDate(2),
      appointmentTime: '09:30',
      description: 'Demo request: kitchen sink drain is running slowly.',
      status: 'Pending',
      createdAt: alexCreatedAt,
      updatedAt: alexCreatedAt,
    },
    {
      id: 'seed-booking-maya-confirmed-electrical',
      customerId: 'customer-maya-patel',
      serviceId: 'electrical',
      serviceName: 'Electrical',
      customerName: 'Maya Patel',
      phone: '+1 555-010-0987',
      address: '456 Oak Avenue',
      appointmentDate: getRelativeDate(5),
      appointmentTime: '14:00',
      description: 'Demo request: dining room light fixture flickers.',
      status: 'Confirmed',
      createdAt: mayaCreatedAt,
      updatedAt: getRelativeTimestamp(-1),
    },
    {
      id: 'seed-booking-alex-completed-appliance',
      customerId: 'customer-alex-rivera',
      serviceId: 'appliance-repair',
      serviceName: 'Appliance repair',
      customerName: 'Alex Rivera',
      phone: '+1 555-010-0142',
      address: '214 North Loop Avenue',
      appointmentDate: getRelativeDate(-7),
      appointmentTime: '11:15',
      description: 'Demo request: refrigerator made a rattling sound.',
      status: 'Completed',
      createdAt: completedCreatedAt,
      updatedAt: getRelativeTimestamp(-7),
    },
  ];
}

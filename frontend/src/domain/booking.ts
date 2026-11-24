import type {
  Booking,
  BookingFormInput,
  BookingStatus,
  CreateBookingCommand,
  ServiceCatalogItem,
  ServiceId,
} from '../types/booking';

export const BOOKING_STATUSES: readonly BookingStatus[] = [
  'Pending',
  'Confirmed',
  'Completed',
  'Cancelled',
];

export const DEFAULT_BOOKING_STATUS: BookingStatus = 'Pending';

export const SERVICE_CATALOG: readonly ServiceCatalogItem[] = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    description: 'Leaks, clogs, fixtures, and pipe repairs.',
  },
  {
    id: 'electrical',
    name: 'Electrical',
    description: 'Outlets, switches, lighting, and basic electrical repairs.',
  },
  {
    id: 'appliance-repair',
    name: 'Appliance repair',
    description: 'Troubleshooting and repairs for common home appliances.',
  },
];

export function isServiceId(value: string): value is ServiceId {
  return SERVICE_CATALOG.some((service) => service.id === value);
}

export function getServiceById(serviceId: string): ServiceCatalogItem | null {
  return SERVICE_CATALOG.find((service) => service.id === serviceId) ?? null;
}

export function canCustomerCancel(status: BookingStatus): boolean {
  return status === 'Pending' || status === 'Confirmed';
}

export function normalizeBookingFormInput(input: BookingFormInput): BookingFormInput {
  const description = input.description?.trim();

  return {
    service: input.service.trim(),
    name: input.name.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    date: input.date.trim(),
    time: input.time.trim(),
    ...(description !== undefined ? { description } : {}),
  };
}

export function createBooking(command: CreateBookingCommand): Booking {
  const normalizedInput = normalizeBookingFormInput(command);
  const service = getServiceById(normalizedInput.service);

  if (service === null) {
    throw new Error('Cannot create a booking for an unknown service.');
  }

  const booking: Booking = {
    id: command.id,
    customerId: command.customerId,
    serviceId: service.id,
    serviceName: service.name,
    customerName: normalizedInput.name,
    phone: normalizedInput.phone,
    address: normalizedInput.address,
    appointmentDate: normalizedInput.date,
    appointmentTime: normalizedInput.time,
    status: DEFAULT_BOOKING_STATUS,
    createdAt: command.createdAt,
    updatedAt: command.createdAt,
  };

  if (normalizedInput.description !== undefined && normalizedInput.description !== '') {
    return {
      ...booking,
      description: normalizedInput.description,
    };
  }

  return booking;
}

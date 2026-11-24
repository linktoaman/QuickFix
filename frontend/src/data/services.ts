import type { Service, ServiceId } from '../types/service';

export const services: readonly Service[] = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    description: 'Leaks, clogs, fixture installs, and pipe repairs handled by trusted pros.',
    price: 'From $89',
    iconKey: 'wrench',
  },
  {
    id: 'electrician',
    name: 'Electrician',
    description: 'Outlets, switches, lighting, panel checks, and basic electrical fixes.',
    price: 'From $99',
    iconKey: 'bolt',
  },
  {
    id: 'ac-repair',
    name: 'AC Repair',
    description: 'Cooling diagnostics, tune-ups, filter issues, and minor air conditioning repairs.',
    price: 'From $119',
    iconKey: 'snowflake',
  },
  {
    id: 'home-cleaning',
    name: 'Home Cleaning',
    description: 'Routine cleaning, deep cleans, move-out refreshes, and tidy-up visits.',
    price: 'From $79',
    iconKey: 'sparkles',
  },
];

export function isServiceId(value: string): value is ServiceId {
  return services.some((service) => service.id === value);
}

export function getServiceById(serviceId: string): Service | null {
  return services.find((service) => service.id === serviceId) ?? null;
}

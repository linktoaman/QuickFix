import { describe, expect, it } from 'vitest';

import { getServiceById, isServiceId, services } from '../services';

describe('services catalog', () => {
  it('defines exactly four discoverable home services', () => {
    expect(services).toHaveLength(4);
    expect(services.map((service) => service.id)).toEqual([
      'plumbing',
      'electrician',
      'ac-repair',
      'home-cleaning',
    ]);
  });

  it('provides complete card content for each service', () => {
    for (const service of services) {
      expect(service.name).not.toBe('');
      expect(service.description).not.toBe('');
      expect(service.price).toMatch(/^From \$/);
      expect(service.iconKey).not.toBe('');
    }
  });

  it('resolves only known service identifiers', () => {
    expect(isServiceId('plumbing')).toBe(true);
    expect(isServiceId('unknown-service')).toBe(false);
    expect(getServiceById('home-cleaning')?.name).toBe('Home Cleaning');
    expect(getServiceById('unknown-service')).toBeNull();
  });
});

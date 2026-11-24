import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ServiceCard from '../ServiceCard';
import { getServiceById } from '../../data/services';
import type { Service, ServiceId } from '../../types/service';

function getRequiredService(serviceId: ServiceId): Service {
  const service = getServiceById(serviceId);

  if (service === null) {
    throw new Error(`Missing test service fixture: ${serviceId}`);
  }

  return service;
}

describe('ServiceCard', () => {
  it('renders service content with an accessible booking button', () => {
    const service = getRequiredService('plumbing');

    render(<ServiceCard service={service} />);

    expect(
      screen.getByRole('region', { name: service.name }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: service.name })).toBeInTheDocument();
    expect(screen.getByText(service.description)).toBeInTheDocument();
    expect(screen.getByText(service.price)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `Book ${service.name}` }),
    ).toBeInTheDocument();
  });

  it('calls the booking handler with the selected service', () => {
    const service = getRequiredService('electrician');
    const onBookService = vi.fn();

    render(<ServiceCard service={service} onBookService={onBookService} />);

    fireEvent.click(screen.getByRole('button', { name: `Book ${service.name}` }));

    expect(onBookService).toHaveBeenCalledTimes(1);
    expect(onBookService).toHaveBeenCalledWith(service);
  });
});

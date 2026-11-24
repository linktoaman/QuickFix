import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import HomePage from '../HomePage';
import { SERVICE_CATALOG } from '../../../domain/booking';

function renderHomePage() {
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  it('renders customer calls to action that route to booking views', () => {
    renderHomePage();

    expect(
      screen.getByRole('link', { name: 'Book a service' }),
    ).toHaveAttribute('href', '/book');
    expect(
      screen.getByRole('link', { name: 'My Bookings' }),
    ).toHaveAttribute('href', '/my-bookings');
  });

  it('renders service discovery cards with accessible booking links', () => {
    renderHomePage();

    const serviceRegion = screen.getByRole('region', { name: 'What needs fixing?' });

    for (const service of SERVICE_CATALOG) {
      const serviceHeading = within(serviceRegion).getByRole('heading', {
        name: service.name,
      });
      const serviceCard = serviceHeading.closest('article');

      expect(serviceCard).not.toBeNull();

      if (serviceCard !== null) {
        expect(within(serviceCard).getByText(service.description)).toBeInTheDocument();
        expect(
          within(serviceCard).getByRole('link', { name: `Book ${service.name}` }),
        ).toHaveAttribute('href', `/book?service=${service.id}`);
      }
    }
  });
});

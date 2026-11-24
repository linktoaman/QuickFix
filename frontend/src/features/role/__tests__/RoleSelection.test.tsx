import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import TopBar from '../../../layout/TopBar';
import { RoleProvider } from '../../../state/RoleContext';

function renderRoleControls() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <RoleProvider>
        <TopBar />
      </RoleProvider>
    </MemoryRouter>,
  );
}

function selectMode(mode: 'customer' | 'admin') {
  fireEvent.change(screen.getByLabelText('Mode'), {
    target: { value: mode },
  });
}

describe('RoleSelection', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows customer navigation and the customer selector when customer mode is selected', async () => {
    renderRoleControls();

    selectMode('customer');

    expect(
      await screen.findByRole('navigation', {
        name: 'Primary navigation',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Services' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Book' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'My Bookings' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Customer')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Admin Dashboard' }),
    ).not.toBeInTheDocument();
  });

  it('shows admin navigation and hides the customer selector when admin mode is selected', async () => {
    renderRoleControls();

    selectMode('admin');

    expect(
      await screen.findByRole('link', { name: 'Admin Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Customer')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Services' })).not.toBeInTheDocument();
  });

  it('updates navigation during role switches without calling a backend', async () => {
    const fetchMock = vi.fn<typeof fetch>();

    vi.stubGlobal('fetch', fetchMock);
    renderRoleControls();

    selectMode('customer');

    expect(await screen.findByRole('link', { name: 'Services' })).toBeInTheDocument();

    selectMode('admin');

    expect(
      await screen.findByRole('link', { name: 'Admin Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Services' })).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not render password or token inputs for mock role controls', () => {
    renderRoleControls();

    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/token/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/password/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/token/i)).not.toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import RoleGuard from '../RoleGuard';
import type { Role } from '../../state/RoleContext';

function renderGuardedRoutes(currentRole?: Role) {
  return render(
    <MemoryRouter initialEntries={['/customer-only']}>
      <Routes>
        <Route path="/" element={<h1>Customer home</h1>} />
        <Route path="/admin" element={<h1>Admin landing</h1>} />
        <Route
          path="/customer-only"
          element={(
            <RoleGuard
              rule={{ path: '/customer-only', allowedRoles: ['customer'] }}
              currentRole={currentRole}
            >
              <h1>Customer route</h1>
            </RoleGuard>
          )}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RoleGuard', () => {
  it('renders a guarded customer route for the customer role', () => {
    renderGuardedRoutes('customer');

    expect(
      screen.getByRole('heading', { name: 'Customer route' }),
    ).toBeInTheDocument();
  });

  it('redirects an admin away from a customer-only route', async () => {
    renderGuardedRoutes('admin');

    expect(
      await screen.findByRole('heading', { name: 'Admin landing' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Customer route' }),
    ).not.toBeInTheDocument();
  });

  it('allows the role-selection route to render before a role is selected', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={(
              <RoleGuard
                allowRoleSelection
                rule={{ path: '/', allowedRoles: ['customer'] }}
              >
                <h1>Choose a role</h1>
              </RoleGuard>
            )}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Choose a role' }),
    ).toBeInTheDocument();
  });
});

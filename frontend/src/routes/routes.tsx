import type { ReactElement } from 'react';
import { useRoutes, type RouteObject } from 'react-router-dom';

import BookingPage from '../features/customer/BookingPage';
import HomePage from '../features/customer/HomePage';
import AppShell from '../layout/AppShell';
import RoleGuard from './RoleGuard';

export type QuickFixRole = 'customer' | 'admin';

export type RouteAccessRule = {
  path: string;
  allowedRoles?: QuickFixRole[];
};

export type RouteGuardOptions = {
  currentRole?: QuickFixRole;
  canAccess?: (rule: RouteAccessRule) => boolean;
  fallbackPath?: string;
};

function getRouteElement(
  element: ReactElement,
  rule: RouteAccessRule,
  options: RouteGuardOptions,
  allowRoleSelection = false,
) {
  return (
    <RoleGuard
      rule={rule}
      currentRole={options.currentRole}
      canAccess={options.canAccess}
      fallbackPath={options.fallbackPath}
      allowRoleSelection={allowRoleSelection}
    >
      {element}
    </RoleGuard>
  );
}

function createAppRoutes(options: RouteGuardOptions): RouteObject[] {
  return [
    {
      path: '/',
      element: <AppShell />,
      children: [
        {
          index: true,
          element: getRouteElement(
            <HomePage />,
            { path: '/', allowedRoles: ['customer'] },
            options,
            true,
          ),
        },
        {
          path: 'book',
          element: getRouteElement(
            <BookingPage />,
            { path: '/book', allowedRoles: ['customer'] },
            options,
          ),
        },
        {
          path: 'my-bookings',
          element: getRouteElement(
            <MyBookingsPlaceholder />,
            { path: '/my-bookings', allowedRoles: ['customer'] },
            options,
          ),
        },
        {
          path: 'admin',
          element: getRouteElement(
            <AdminPlaceholder />,
            { path: '/admin', allowedRoles: ['admin'] },
            options,
          ),
        },
      ],
    },
  ];
}

function AppRoutes(options: RouteGuardOptions) {
  return useRoutes(createAppRoutes(options));
}

function MyBookingsPlaceholder() {
  return (
    <section className="page-panel" aria-labelledby="my-bookings-title">
      <p className="eyebrow">Customer workspace</p>
      <h1 id="my-bookings-title">My Bookings</h1>
      <p>No customer booking data is stored in this scaffold.</p>
    </section>
  );
}

function AdminPlaceholder() {
  return (
    <section className="page-panel" aria-labelledby="admin-title">
      <p className="eyebrow">Operations workspace</p>
      <h1 id="admin-title">Admin Dashboard</h1>
      <p>Admin summaries will appear after local booking state is added.</p>
    </section>
  );
}

export default AppRoutes;

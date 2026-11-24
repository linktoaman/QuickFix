import type { ReactElement } from 'react';
import { useRoutes, type RouteObject } from 'react-router-dom';

import AdminStats from '../features/admin/AdminStats';
import BookingPage from '../features/customer/BookingPage';
import HomePage from '../features/customer/HomePage';
import MyBookingsPage from '../features/customer/MyBookingsPage';
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
            <MyBookingsPage />,
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

function AdminPlaceholder() {
  return (
    <section className="page-panel" aria-labelledby="admin-title">
      <p className="eyebrow">Operations workspace</p>
      <h1 id="admin-title">Admin Dashboard</h1>
      <AdminStats />
    </section>
  );
}

export default AppRoutes;

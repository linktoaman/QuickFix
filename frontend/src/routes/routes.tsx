import type { ReactElement } from 'react';
import { Link, useRoutes, type RouteObject } from 'react-router-dom';

import { SERVICE_CATALOG } from '../domain/booking';
import BookingPage from '../features/customer/BookingPage';
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
            <HomePlaceholder />,
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

function HomePlaceholder() {
  return (
    <section className="hero" aria-labelledby="home-title">
      <div className="hero-copy">
        <p className="eyebrow">Frontend-only service scheduling</p>
        <h1 id="home-title">QuickFix</h1>
        <p>
          A clean app shell for customers and admins to explore repair services,
          manage local bookings, and keep the MVP deployable as static assets.
        </p>
        <div className="actions" aria-label="Available app areas">
          <Link className="button primary" to="/book">
            Book service
          </Link>
          <Link className="button secondary" to="/my-bookings">
            My bookings
          </Link>
        </div>
      </div>

      <div className="service-panel" aria-label="Service categories">
        {SERVICE_CATALOG.map((service) => (
          <article className="service-card" key={service.id}>
            <span aria-hidden="true" />
            <h2>{service.name}</h2>
            <p>{service.description}</p>
            <Link
              className="service-card__link"
              to={`/book?service=${service.id}`}
            >
              Schedule this service
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
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

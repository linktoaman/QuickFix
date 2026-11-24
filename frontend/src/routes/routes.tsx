import type { ReactElement } from 'react';
import { Link, Navigate, useRoutes, type RouteObject } from 'react-router-dom';

import AppShell from '../layout/AppShell';

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

const serviceHighlights = [
  'Plumbing',
  'Electrical',
  'Appliance repair',
];

function getRouteElement(
  element: ReactElement,
  rule: RouteAccessRule,
  options: RouteGuardOptions,
) {
  const fallbackPath = options.fallbackPath ?? '/';
  const hasRoleAccess = (
    options.currentRole === undefined
    || rule.allowedRoles === undefined
    || rule.allowedRoles.includes(options.currentRole)
  );
  const hasCustomAccess = options.canAccess?.(rule) ?? true;

  if (!hasRoleAccess || !hasCustomAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return element;
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
            { path: '/', allowedRoles: ['customer', 'admin'] },
            options,
          ),
        },
        {
          path: 'book',
          element: getRouteElement(
            <BookPlaceholder />,
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
          <Link className="button secondary" to="/admin">
            Admin view
          </Link>
        </div>
      </div>

      <div className="service-panel" aria-label="Service categories">
        {serviceHighlights.map((service) => (
          <article className="service-card" key={service}>
            <span aria-hidden="true" />
            <h2>{service}</h2>
            <p>Ready for the booking flow in the next feature slice.</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function BookPlaceholder() {
  return (
    <section className="page-panel" aria-labelledby="book-title">
      <p className="eyebrow">Customer workspace</p>
      <h1 id="book-title">Book a Service</h1>
      <p>
        Booking form controls will appear here when the customer booking flow is
        connected to local browser storage.
      </p>
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

import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';

import type { Role } from '../state/RoleContext';
import type { RouteAccessRule } from './routes';

const defaultRouteByRole: Record<Role, string> = {
  customer: '/',
  admin: '/admin',
};

export type RoleGuardProps = {
  children: ReactElement;
  rule: RouteAccessRule;
  currentRole?: Role;
  canAccess?: (rule: RouteAccessRule) => boolean;
  fallbackPath?: string;
  allowRoleSelection?: boolean;
};

function getFallbackPath(currentRole?: Role, fallbackPath = '/') {
  return currentRole === undefined ? fallbackPath : defaultRouteByRole[currentRole];
}

function RoleGuard({
  children,
  rule,
  currentRole,
  canAccess,
  fallbackPath,
  allowRoleSelection = false,
}: RoleGuardProps) {
  // This is only a UI-level mock role guard for the browser MVP, not security.
  if (currentRole === undefined && allowRoleSelection) {
    return children;
  }

  const hasRoleAccess = (
    rule.allowedRoles === undefined
    || (currentRole !== undefined && rule.allowedRoles.includes(currentRole))
  );
  const hasCustomAccess = canAccess?.(rule) ?? true;

  if (!hasRoleAccess || !hasCustomAccess) {
    return <Navigate to={getFallbackPath(currentRole, fallbackPath)} replace />;
  }

  return children;
}

export default RoleGuard;

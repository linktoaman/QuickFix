import useRole from './hooks/useRole';
import AppRoutes from './routes/routes';
import type { RouteAccessRule } from './routes/routes';
import { BookingProvider } from './state/BookingContext';
import { RoleProvider } from './state/RoleContext';

function App() {
  return (
    <RoleProvider>
      <BookingProvider>
        <RoleAwareRoutes />
      </BookingProvider>
    </RoleProvider>
  );
}

function RoleAwareRoutes() {
  const { selectedRole, selectedCustomerId } = useRole();

  function canAccessRoute(rule: RouteAccessRule) {
    if (rule.allowedRoles === undefined || rule.path === '/') {
      return true;
    }

    if (selectedRole === null || !rule.allowedRoles.includes(selectedRole)) {
      return false;
    }

    if (selectedRole === 'customer') {
      return selectedCustomerId !== null;
    }

    return true;
  }

  return (
    <AppRoutes
      currentRole={selectedRole ?? undefined}
      canAccess={canAccessRoute}
      fallbackPath="/"
    />
  );
}

export default App;

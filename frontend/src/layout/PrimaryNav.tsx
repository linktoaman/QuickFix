import { NavLink } from 'react-router-dom';

import useRole from '../hooks/useRole';
import type { Role } from '../state/RoleContext';

const customerNavItems = [
  { label: 'Services', to: '/', end: true },
  { label: 'Book', to: '/book', end: false },
  { label: 'My Bookings', to: '/my-bookings', end: false },
];

const adminNavItems = [
  { label: 'Admin Dashboard', to: '/admin', end: false },
];

function getPrimaryNavItems(selectedRole: Role | null) {
  if (selectedRole === 'customer') {
    return customerNavItems;
  }

  if (selectedRole === 'admin') {
    return adminNavItems;
  }

  return [];
}

function PrimaryNav() {
  const { selectedRole } = useRole();
  const primaryNavItems = getPrimaryNavItems(selectedRole);

  if (primaryNavItems.length === 0) {
    return null;
  }

  return (
    <nav className="topnav" aria-label="Primary navigation">
      {primaryNavItems.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default PrimaryNav;

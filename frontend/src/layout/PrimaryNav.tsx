import { NavLink } from 'react-router-dom';

const primaryNavItems = [
  { label: 'Home', to: '/', end: true },
  { label: 'Book', to: '/book', end: false },
  { label: 'My Bookings', to: '/my-bookings', end: false },
  { label: 'Admin', to: '/admin', end: false },
];

function PrimaryNav() {
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

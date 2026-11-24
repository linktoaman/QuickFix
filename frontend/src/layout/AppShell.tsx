import { Outlet } from 'react-router-dom';

import TopBar from './TopBar';

function AppShell() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <TopBar />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;

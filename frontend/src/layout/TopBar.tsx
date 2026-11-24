import { Link } from 'react-router-dom';

import PrimaryNav from './PrimaryNav';

function TopBar() {
  return (
    <header className="topbar">
      <Link className="brand" to="/" aria-label="QuickFix home">
        <span className="brand-mark" aria-hidden="true">
          QF
        </span>
        <span>QuickFix</span>
      </Link>
      <div className="navigation-container">
        <PrimaryNav />
      </div>
    </header>
  );
}

export default TopBar;

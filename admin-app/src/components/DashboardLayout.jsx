import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import PersistenceNotice from './PersistenceNotice.jsx';

export default function DashboardLayout() {
  const [navOpen, setNavOpen] = useState(false);

  const closeNav = useCallback(() => setNavOpen(false), []);

  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [navOpen]);

  return (
    <div className="app">
      {navOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close menu"
          onClick={closeNav}
        />
      ) : null}

      <Sidebar open={navOpen} onNavigate={closeNav} />

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="topbar-menu-btn"
              aria-label={navOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={navOpen}
              onClick={() => setNavOpen((open) => !open)}
            >
              <span className="topbar-menu-icon" aria-hidden="true" />
            </button>
            <div className="topbar-status">
              <span className="dot-green" />
              <span>Site is live · shreejagannathmandirmk.in</span>
            </div>
          </div>
        </div>
        <div className="content">
          <PersistenceNotice />
          <Outlet />
        </div>
      </main>
    </div>
  );
}

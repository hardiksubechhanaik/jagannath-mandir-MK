import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { store } from '../data/store.js';
import mandirLogo from '../assets/mandir-logo.png';

const GROUPS = [
  {
    label: 'Overview',
    items: [{ to: '/', end: true, icon: '◈', label: 'Overview' }],
  },
  {
    label: 'Content',
    items: [
      { to: '/gallery', icon: '▦', label: 'Gallery' },
      { to: '/blogs', icon: '✎', label: 'Blog Posts' },
      { to: '/festivals', icon: '✦', label: 'Festivals' },
      { to: '/timings', icon: '◷', label: 'Timings' },
    ],
  },
  {
    label: 'Inbox & Config',
    items: [
      { to: '/donations', icon: '❦', label: 'Donations' },
      { to: '/messages', icon: '✉', label: 'Messages', badge: 'messages' },
      { to: '/settings', icon: '⚙', label: 'Settings' },
    ],
  },
];

export default function Sidebar({ open = false, onNavigate }) {
  const { logout } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    store.list('messages')
      .then((msgs) => setUnread(msgs.filter((m) => m.unread).length))
      .catch(() => setUnread(0));
  }, [location.pathname]);

  useEffect(() => {
    onNavigate?.();
  }, [location.pathname, onNavigate]);

  return (
    <aside className={'sidebar' + (open ? ' open' : '')}>
      <div className="brand">
        <img src={mandirLogo} alt="" className="brand-logo-image" width={36} height={36} />
        <div>
          <div className="brand-name">Mandir Admin</div>
          <div className="brand-role">Content Manager</div>
        </div>
      </div>

      <nav className="nav">
        {GROUPS.map((g) => (
          <div key={g.label}>
            <div className="nav-label">{g.label}</div>
            {g.items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
              >
                <span className="nav-icon">{it.icon}</span>
                {it.label}
                {it.badge === 'messages' && unread > 0 && (
                  <span className="nav-badge">{unread}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="admin-chip">
          <div className="admin-avatar">A</div>
          <div>
            <div className="admin-name">Administrator</div>
            <div className="admin-user">admin</div>
          </div>
        </div>
        <button className="btn-signout" onClick={logout}>Sign Out</button>
      </div>
    </aside>
  );
}

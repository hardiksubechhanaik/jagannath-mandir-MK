import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import TempleLogo from '../components/TempleLogo';
import { apiPost, apiPostAuth } from '../api/client';
import { getAdminAppUrl } from '../lib/authSession';
import { setVolunteerSession } from '../lib/rathWallSession';
import styles from '../styles/login.module.css';

const ADMIN_ROLES = new Set(['admin', 'manager']);

function volunteerDestination(searchParams) {
  const tab = searchParams.get('tab');
  if (tab === 'gps') return '/rath-wall-volunteer?tab=gps';
  if (tab === 'creators') return '/rath-wall-volunteer?tab=creators';
  if (tab === 'divyang') return '/rath-wall-volunteer?tab=divyang';
  if (tab === 'sankalp') return '/rath-wall-volunteer?tab=sankalp';
  if (tab === 'diya') return '/rath-wall-volunteer?tab=diya';
  return '/rath-wall-volunteer';
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiPost('/api/auth/login', { username, password });
      const role = data.user?.role;

      if (ADMIN_ROLES.has(role)) {
        const handoff = await apiPostAuth('/api/auth/handoff', {}, data.token);
        const adminUrl = getAdminAppUrl();
        const sameOrigin = typeof window !== 'undefined'
          && adminUrl.startsWith(window.location.origin);
        if (sameOrigin) {
          sessionStorage.setItem('mandir_admin_bootstrap', JSON.stringify({
            token: data.token,
            user: data.user,
            at: Date.now(),
          }));
          window.location.href = `${adminUrl}/login?bootstrap=1`;
        } else {
          window.location.href = `${adminUrl}/login?code=${encodeURIComponent(handoff.code)}`;
        }
        return;
      }

      if (role === 'volunteer') {
        const wallToken = data.volunteerWallToken;
        if (!wallToken) {
          setError('Volunteer session could not be started.');
          return;
        }
        setVolunteerSession(wallToken);
        navigate(volunteerDestination(searchParams), { replace: true });
        return;
      }

      setError('This account does not have access to sign in here.');
    } catch (err) {
      setError(err.message ?? 'Incorrect username or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.logoWrap}>
            <TempleLogo size={52} />
          </div>
          <p className={styles.odia}>ଜୟ ଜଗନ୍ନାଥ</p>
          <h1 className={styles.title}>Sign in</h1>
          <p className={styles.lead}>
            Mandir managers and Ratha Yatra volunteers use this page to access their tools.
          </p>
        </div>

        <form className={styles.card} onSubmit={handleSubmit}>
          <label htmlFor="login-username" className={styles.label}>
            Username
          </label>
          <input
            id="login-username"
            className={styles.input}
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
            placeholder="Your username"
            autoComplete="username"
            required
          />

          <label htmlFor="login-password" className={styles.label}>
            Password
          </label>
          <input
            id="login-password"
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <Link to="/" className={styles.back}>
          ← Back to website
        </Link>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { resolveApiBaseUrl } from '../lib/apiBase.js';

const BOOTSTRAP_KEY = 'mandir_admin_bootstrap';

function getSiteUrl() {
  if (import.meta.env.VITE_SITE_URL) {
    return import.meta.env.VITE_SITE_URL.replace(/\/$/, '');
  }
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5174';
}

function getAdminHome() {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
}

/** Survives React Strict Mode remounts within the same page load. */
const exchangeStarted = new Set();

function finishLogin(data, lockKey) {
  if (lockKey) sessionStorage.setItem(lockKey, 'done');
  localStorage.setItem('mandir_token', data.token);
  localStorage.setItem('mandir_auth', JSON.stringify(data.user));
  window.location.replace(getAdminHome());
}

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [exchangeError, setExchangeError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const bootstrap = searchParams.get('bootstrap') === '1';

    if (bootstrap) {
      try {
        const raw = sessionStorage.getItem(BOOTSTRAP_KEY);
        sessionStorage.removeItem(BOOTSTRAP_KEY);
        if (raw) {
          const payload = JSON.parse(raw);
          if (payload?.token && payload?.user && Date.now() - Number(payload.at || 0) < 60_000) {
            finishLogin(payload, 'bootstrap:done');
            return;
          }
        }
      } catch {
        /* fall through */
      }
      setExchangeError('Sign-in session expired. Redirecting…');
      window.setTimeout(() => {
        window.location.replace(`${getSiteUrl()}/login?redirect=admin`);
      }, 1500);
      return;
    }

    if (!code) {
      if (loading) return;
      if (user) {
        navigate('/', { replace: true });
        return;
      }
      window.location.replace(`${getSiteUrl()}/login?redirect=admin`);
      return;
    }

    const lockKey = `handoff:${code}`;

    if (sessionStorage.getItem(lockKey) === 'done' && localStorage.getItem('mandir_token')) {
      window.location.replace(getAdminHome());
      return;
    }

    sessionStorage.removeItem(lockKey);

    if (exchangeStarted.has(code)) {
      return;
    }
    exchangeStarted.add(code);

    localStorage.removeItem('mandir_token');
    localStorage.removeItem('mandir_auth');

    async function exchange() {
      try {
        const { data } = await axios.post(`${resolveApiBaseUrl()}/auth/exchange-handoff`, { code });
        finishLogin(data, lockKey);
      } catch (err) {
        exchangeStarted.delete(code);
        const msg = err.response?.data?.message;
        setExchangeError(msg || 'Could not complete sign in. Please try again from the website login page.');
        window.setTimeout(() => {
          window.location.replace(`${getSiteUrl()}/login?redirect=admin`);
        }, 2500);
      }
    }

    exchange();
  }, [searchParams, user, loading, navigate]);

  return (
    <div className="login-wrap">
      <div className="login-inner">
        <p className="login-note">
          {exchangeError || 'Completing sign in…'}
        </p>
      </div>
    </div>
  );
}

export { BOOTSTRAP_KEY };

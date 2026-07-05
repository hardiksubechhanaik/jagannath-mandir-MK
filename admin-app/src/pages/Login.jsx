import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5174';

/** Survives React Strict Mode remounts within the same page load. */
const exchangeStarted = new Set();

function resolveApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const trimmed = raw.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

function finishLogin(data, lockKey) {
  sessionStorage.setItem(lockKey, 'done');
  localStorage.setItem('mandir_token', data.token);
  localStorage.setItem('mandir_auth', JSON.stringify(data.user));
  window.location.replace('/');
}

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [exchangeError, setExchangeError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      if (loading) return;
      if (user) {
        navigate('/', { replace: true });
        return;
      }
      window.location.replace(`${SITE_URL}/login?redirect=admin`);
      return;
    }

    const lockKey = `handoff:${code}`;

    if (sessionStorage.getItem(lockKey) === 'done' && localStorage.getItem('mandir_token')) {
      window.location.replace('/');
      return;
    }

    // Clear stale lock from an earlier broken attempt.
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
          window.location.replace(`${SITE_URL}/login?redirect=admin`);
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

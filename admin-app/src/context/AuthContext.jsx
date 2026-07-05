import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('code') && window.location.pathname === '/login') {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('mandir_token');
    const saved = localStorage.getItem('mandir_auth');

    if (!token) {
      setLoading(false);
      return;
    }

    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }

    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem('mandir_auth', JSON.stringify(data));
      })
      .catch(() => {
        localStorage.removeItem('mandir_token');
        localStorage.removeItem('mandir_auth');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('mandir_token', data.token);
      localStorage.setItem('mandir_auth', JSON.stringify(data.user));
      setUser(data.user);
      return true;
    } catch {
      return false;
    }
  }

  function logout() {
    localStorage.removeItem('mandir_token');
    localStorage.removeItem('mandir_auth');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

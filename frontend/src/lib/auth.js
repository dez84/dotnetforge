'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'dotnetforge.auth';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Restore session from localStorage (persists across devices via login).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setToken(parsed.token);
        setUser(parsed.user);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  function persist(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    if (nextToken) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  async function login(email, password) {
    const { token: t, user: u } = await api.login(email, password);
    persist(t, u);
    return u;
  }

  async function register(email, displayName, password) {
    const { token: t, user: u } = await api.register(email, displayName, password);
    persist(t, u);
    return u;
  }

  function logout() {
    persist(null, null);
  }

  return (
    <AuthContext.Provider value={{ token, user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('medpulse_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.getMe()
        .then(res => {
          setUser(res.user);
        })
        .catch(err => {
          console.error('Session expired:', err);
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      // Default to demo admin for instant preview experience
      demoLogin('admin@hospital.com', 'admin123');
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('medpulse_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const demoLogin = async (email, password) => {
    try {
      await login(email, password);
    } catch (e) {
      console.warn('Demo login bypass fallback');
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('medpulse_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

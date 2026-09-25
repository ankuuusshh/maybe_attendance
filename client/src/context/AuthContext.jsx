import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, getToken, setToken, removeToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => getToken());
  const [loading, setLoading] = useState(true);

  // On mount: if a token exists, restore the user via GET /api/auth/me
  useEffect(() => {
    const restore = async () => {
      const savedToken = getToken();
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const data = await authApi.me();
        // backend returns { _id, name, email, role, ... }
        setUser(data?.user || data);
      } catch {
        // Token invalid or expired — clear it
        removeToken();
        setTokenState(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  /**
   * Log in with email + password.
   * Saves JWT, sets user state.
   * Returns the user object so callers can navigate by role.
   */
  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    // backend: { token, user: { _id, name, email, role, ... } }
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    return data.user;
  };

  /**
   * Log out — clears token, user state.
   */
  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

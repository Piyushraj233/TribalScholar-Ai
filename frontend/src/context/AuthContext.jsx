import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('tribalscholar_token') || null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Fetch current user if token exists
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const u = await apiRequest('/auth/me');
          setUser(u);
          loadNotifications();
        } catch (err) {
          console.warn("Session expired or invalid token:", err);
          logout();
        }
      } else {
        // Auto demo login as Rahul for initial seamless SIH walkthrough experience
        await quickDemoLogin('applicant');
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const loadNotifications = async () => {
    try {
      const notifs = await apiRequest('/notifications');
      setNotifications(notifs || []);
    } catch (e) {
      console.warn("Failed to load notifications:", e);
    }
  };

  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('tribalscholar_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    loadNotifications();
    return data.user;
  };

  const quickDemoLogin = async (role = 'applicant') => {
    try {
      const data = await apiRequest(`/auth/demo-login/${role}`, {
        method: 'POST',
      });
      localStorage.setItem('tribalscholar_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      const notifs = await apiRequest('/notifications');
      setNotifications(notifs || []);
      return data.user;
    } catch (err) {
      console.error("Demo login error:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem('tribalscholar_token');
    setToken(null);
    setUser(null);
    setNotifications([]);
  };

  const markNotificationRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error("Error marking notification read:", e);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      quickDemoLogin,
      logout,
      notifications,
      unreadCount,
      markNotificationRead,
      refreshUser: loadNotifications
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

import React, { useState, useEffect } from "react";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user session email or token exists
    const token = localStorage.getItem('auth_token') || localStorage.getItem('userEmail');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    // Save user details securely in localStorage upon successful login
    if (userData.email) {
      localStorage.setItem('userEmail', userData.email);
    }
    if (userData.userId) {
      localStorage.setItem('userId', userData.userId);
    }
    localStorage.setItem('auth_token', userData.token || 'active_session');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
  };

  if (isAuthenticated) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
}
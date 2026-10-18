import React, { useState, useEffect } from "react";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  if (isAuthenticated) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
}
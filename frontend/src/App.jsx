import React, { useState, useEffect } from "react";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./components/Dashboard";
import { LanguageProvider } from "./components/LanguageContext";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
  };

  return (
    <LanguageProvider>
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </LanguageProvider>
  );
}
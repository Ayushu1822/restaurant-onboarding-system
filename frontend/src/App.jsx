import React, { useState, useEffect } from "react";
import LoginScreen from "./components/LoginScreen";
import { PosLayout } from "./components/PosLayout";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check login state when app starts
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // If logged in, show the complete FOODOS POS Dashboard layout
  if (isAuthenticated) {
    return <PosLayout />;
  }

  // Otherwise, show your exact sign-in / registration screen
  return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
}
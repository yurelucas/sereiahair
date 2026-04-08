/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Professionals from "./pages/Professionals";
import Clients from "./pages/Clients";
import Services from "./pages/Services";
import PublicBooking from "./pages/PublicBooking";
import { User } from "./types";

export default function App() {
  const [user, setUser] = React.useState<User | null>(() => {
    const saved = localStorage.getItem("sereia_user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("sereia_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("sereia_user");
  };

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/agendar" element={<PublicBooking />} />

        {/* Auth Routes */}
        {!user ? (
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        ) : (
          <Route
            path="*"
            element={
              <Layout onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/agenda" element={<Appointments />} />
                  <Route path="/profissionais" element={<Professionals />} />
                  <Route path="/clientes" element={<Clients />} />
                  <Route path="/servicos" element={<Services />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            }
          />
        )}
      </Routes>
      <Toaster position="top-center" richColors />
    </Router>
  );
}

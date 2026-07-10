// ============================================
import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import AuthApp from "../pages/auth/AuthApp";
import AdminDashboard from "../layouts/AdminDashboard";
import Overview from "../pages/Overview";
import GiftCards from "../pages/GiftCards";
import AccountUpgrades from "../pages/AccountUpgrades";
import Withdrawals from "../pages/Withdrawals";
import Transactions from "../pages/Transactions";
import UsersTab from "../pages/Users";
import SettingsTab from "../pages/Settings";

const Routy = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on app load
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#FF006A]">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-4xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes - Only accessible when NOT authenticated */}
        {!isAuthenticated ? (
          <>
            <Route
              path="/"
              element={<AuthApp setIsAuthenticated={setIsAuthenticated} />}
            />
            <Route
              path="/auth/*"
              element={<AuthApp setIsAuthenticated={setIsAuthenticated} />}
            />
            {/* Redirect any other route to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            {/* Dashboard Routes - Only accessible when authenticated */}
            <Route
              path="/u"
              element={
                <AdminDashboard setIsAuthenticated={setIsAuthenticated} />
              }
            >
              <Route index element={<Navigate to="overview" replace />} />

              <Route path="overview" element={<Overview />} />

              <Route path="giftcards" element={<GiftCards />} />

              <Route path="upgrades" element={<AccountUpgrades />} />

              <Route path="withdrawals" element={<Withdrawals />} />

              <Route path="transactions" element={<Transactions />} />

              <Route path="users" element={<UsersTab />} />

              <Route path="settings" element={<SettingsTab />} />
            </Route>
            {/* Redirect any other route to dashboard */}
            <Route path="*" element={<Navigate to="/u" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default Routy;

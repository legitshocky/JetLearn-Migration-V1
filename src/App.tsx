import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Communication } from "./pages/Communication";
import { AuditLog } from "./pages/AuditLog";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/communication"
            element={
              <ProtectedRoute>
                <Communication />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-log"
            element={
              <ProtectedRoute>
                <AuditLog />
              </ProtectedRoute>
            }
          />
          {/* Add more routes as pages are implemented */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

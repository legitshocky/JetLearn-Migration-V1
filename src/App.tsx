import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Communication } from "./pages/Communication";
import { AuditLog } from "./pages/AuditLog";
import { AuditCenter } from "./pages/AuditCenter";
import History from "./pages/History";
import Teachers from "./pages/Teachers";
import TeacherIntelligence from "./pages/TeacherIntelligence";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import Courses from "./pages/Courses";
import Reports from "./pages/Reports";
import SystemHealth from "./pages/SystemHealth";
import TeacherPersona from "./pages/TeacherPersona";
import AIPM from "./pages/AIPM";
import Batch from "./pages/Batch";
import FinancialCommunications from "./pages/FinancialCommunications";
import EmailActivities from "./pages/EmailActivities";
import Settings from "./pages/Settings";
import LearnerMigration from "./pages/LearnerMigration";
import MinecraftEmail from "./pages/MinecraftEmail";
import RobloxEmail from "./pages/RobloxEmail";
import MyProfile from "./pages/MyProfile";
import Support from "./pages/Support";
import Documentation from "./pages/Documentation";

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
          <Route
            path="/audit-center"
            element={
              <ProtectedRoute>
                <AuditCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers"
            element={
              <ProtectedRoute>
                <Teachers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers/intelligence"
            element={
              <ProtectedRoute>
                <TeacherIntelligence />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers/profile/:name"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/system-health"
            element={
              <ProtectedRoute>
                <SystemHealth />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-persona"
            element={
              <ProtectedRoute>
                <TeacherPersona />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-pm"
            element={
              <ProtectedRoute>
                <AIPM />
              </ProtectedRoute>
            }
          />
          <Route
            path="/batch"
            element={
              <ProtectedRoute>
                <Batch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financial-communications"
            element={
              <ProtectedRoute>
                <FinancialCommunications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/email-activities"
            element={
              <ProtectedRoute>
                <EmailActivities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learner-migration"
            element={
              <ProtectedRoute>
                <LearnerMigration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minecraft-email"
            element={
              <ProtectedRoute>
                <MinecraftEmail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roblox-email"
            element={
              <ProtectedRoute>
                <RobloxEmail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-profile"
            element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documentation"
            element={
              <ProtectedRoute>
                <Documentation />
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

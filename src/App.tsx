import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { supabase } from './lib/supabase';
import { initializeNotifications } from './services/notificationService';

// Screens
import Login from './screens/Auth/Login';
import Dashboard from './screens/Dashboard/Dashboard';
import AvailableJobs from './screens/Jobs/AvailableJobs';
import ActiveJob from './screens/Jobs/ActiveJob';
import JobHistory from './screens/Jobs/JobHistory';
import Profile from './screens/Profile/Profile';
import Earnings from './screens/Earnings/Earnings';
import Compliance from './screens/Compliance/Compliance';
import Settings from './screens/Settings/Settings';
import Messages from './screens/Messages/Messages';
import MessageChat from './screens/Messages/MessageChat';

// Components
import BottomNav from './components/layout/BottomNav';

// Styles
import './styles/global.css';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const notificationInitialized = useRef(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthenticated(!!user);

      // Initialize notifications once per session after successful authentication
      if (user && !notificationInitialized.current) {
        notificationInitialized.current = true;
        try {
          await initializeNotifications(user.id);
        } catch (notificationError) {
          // Gracefully handle notification errors - don't block authentication
          console.error('[App] Notification initialization failed:', notificationError);
        }
      }
    } catch (error) {
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return authenticated ? <>{children}</> : <Navigate to="/" replace />;
};

// Layout wrapper for authenticated pages
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AvailableJobs />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/active"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ActiveJob />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <AppLayout>
                <JobHistory />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/earnings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Earnings />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/compliance"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Compliance />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Messages />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/:assignmentId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MessageChat />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to dashboard if authenticated, login if not */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Analytics />
    </Router>
  );
}

export default App;

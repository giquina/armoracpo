import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { supabase } from './lib/supabase';
import { initializeNotifications } from './services/notificationService';
import { PageTransition } from './components/animations/PageTransition';

// Screens
import Login from './screens/Auth/Login';
import Signup from './screens/Auth/Signup';
import Dashboard from './screens/Dashboard/Dashboard';
import Jobs from './screens/Jobs/Jobs';
import AvailableJobs from './screens/Jobs/AvailableJobs';
import ActiveJob from './screens/Jobs/ActiveJob';
import JobHistory from './screens/Jobs/JobHistory';
import Profile from './screens/Profile/Profile';
import Earnings from './screens/Earnings/Earnings';
import Compliance from './screens/Compliance/Compliance';
import Settings from './screens/Settings/Settings';
import Messages from './screens/Messages/Messages';
import MessageChat from './screens/Messages/MessageChat';
import IncidentReports from './screens/Incidents/IncidentReports';
import IncidentReportDetail from './screens/Incidents/IncidentReportDetail';
import NewIncidentReport from './screens/Incidents/NewIncidentReport';
import DailyOccurrenceBook from './screens/DOB/DailyOccurrenceBook';

// Components
import BottomNav from './components/layout/BottomNav';

// Styles
import './styles/global.css';

// Dev mode bypass flag (set via sessionStorage when using DevPanel)
const isDevMode = () => {
  return process.env.NODE_ENV === 'development' && sessionStorage.getItem('devMode') === 'true';
};

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

  // Allow dev mode bypass
  if (isDevMode()) {
    console.log('[App] Dev mode active - bypassing authentication');
    return <>{children}</>;
  }

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

// Animated routes wrapper
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PageTransition variant="fade">
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/signup"
          element={
            <PageTransition variant="fade">
              <Signup />
            </PageTransition>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition variant="fade">
                  <Dashboard />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition variant="fade">
                  <Jobs />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/available"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition variant="fade">
                  <AvailableJobs />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/active"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition variant="fade">
                  <ActiveJob />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition variant="fade">
                  <JobHistory />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition variant="fade">
                  <Profile />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/earnings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition variant="fade">
                  <Earnings />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/compliance"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition variant="fade">
                  <Compliance />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition variant="fade">
                  <Settings />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition variant="fade">
                  <Messages />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/:assignmentId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition variant="fade">
                  <MessageChat />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition variant="fade">
                  <IncidentReports />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents/new"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition variant="fade">
                  <NewIncidentReport />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition variant="fade">
                  <IncidentReportDetail />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dob"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition variant="fade">
                  <DailyOccurrenceBook />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to dashboard if authenticated, login if not */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AnimatedRoutes />
      <Analytics />
    </Router>
  );
}

export default App;
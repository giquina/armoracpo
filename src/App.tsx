import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { supabase } from './lib/supabase';
import { initializeNotifications } from './services/notificationService';
import { PageTransition } from './components/animations/PageTransition';
import { LoadingScreen, OfflineIndicator } from './components/common';

// Eager load critical screens for initial render
import Splash from './screens/Splash';
import Welcome from './screens/Welcome';

// Lazy load all other screens for code splitting
const Login = lazy(() => import('./screens/Auth/Login'));
const Signup = lazy(() => import('./screens/Auth/Signup'));
const Dashboard = lazy(() => import('./screens/Dashboard/Dashboard'));
const Jobs = lazy(() => import('./screens/Jobs/Jobs'));
const AvailableJobs = lazy(() => import('./screens/Jobs/AvailableJobs'));
const ActiveJob = lazy(() => import('./screens/Jobs/ActiveJob'));
const JobHistory = lazy(() => import('./screens/Jobs/JobHistory'));
const Profile = lazy(() => import('./screens/Profile/Profile'));
const Earnings = lazy(() => import('./screens/Earnings/Earnings'));
const Compliance = lazy(() => import('./screens/Compliance/Compliance'));
const Settings = lazy(() => import('./screens/Settings/Settings'));
const Messages = lazy(() => import('./screens/Messages/Messages'));
const MessageChat = lazy(() => import('./screens/Messages/MessageChat'));
const IncidentReports = lazy(() => import('./screens/Incidents/IncidentReports'));
const IncidentReportDetail = lazy(() => import('./screens/Incidents/IncidentReportDetail'));
const NewIncidentReport = lazy(() => import('./screens/Incidents/NewIncidentReport'));
const DailyOccurrenceBook = lazy(() => import('./screens/DOB/DailyOccurrenceBook'));

// Lazy load components
const BottomNav = lazy(() => import('./components/layout/BottomNav'));

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
    <Suspense fallback={<LoadingScreen />}>
      {children}
      <BottomNav />
    </Suspense>
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
          path="/welcome"
          element={
            <PageTransition variant="fade">
              <Welcome />
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
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkInitialAuth();
  }, []);

  const checkInitialAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Show splash screen first
  if (showSplash) {
    return <Splash onComplete={handleSplashComplete} />;
  }

  // Check if this is first-time user (hasn't seen welcome)
  const hasSeenWelcome = localStorage.getItem('hasSeenWelcome') === 'true';
  const shouldShowWelcome = !isCheckingAuth && !isAuthenticated && !hasSeenWelcome;

  // Show welcome for first-time users
  if (shouldShowWelcome) {
    return <Welcome />;
  }

  return (
    <Router>
      <OfflineIndicator />
      <AnimatedRoutes />
      <Analytics />
    </Router>
  );
}

export default App;
import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import { Toaster } from '@/components/ui/toaster';

import HomePage from '@/pages/HomePage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import MasterProfileSetup from '@/pages/MasterProfileSetup.jsx';
import PaymentVerificationPage from '@/pages/PaymentVerificationPage.jsx';
import MasterDashboard from '@/pages/MasterDashboard.jsx';
import ClientMapDiscovery from '@/pages/ClientMapDiscovery.jsx';
import MasterDetailPage from '@/pages/MasterDetailPage.jsx';

function AppRoutes() {
  const { currentUser, userType } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/signup"
        element={
          currentUser ? (
            <Navigate to={userType === 'master' ? '/master/setup' : '/client/map'} replace />
          ) : (
            <SignupPage />
          )
        }
      />
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to={userType === 'master' ? '/master/dashboard' : '/client/map'} replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/master/setup"
        element={
          <ProtectedRoute requiredUserType="master">
            <MasterProfileSetup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/master/payment"
        element={
          <ProtectedRoute requiredUserType="master">
            <PaymentVerificationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/master/dashboard"
        element={
          <ProtectedRoute requiredUserType="master">
            <MasterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/map"
        element={
          <ProtectedRoute requiredUserType="client">
            <ClientMapDiscovery />
          </ProtectedRoute>
        }
      />
      <Route
        path="/master/:id"
        element={
          <ProtectedRoute requiredUserType="client">
            <MasterDetailPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
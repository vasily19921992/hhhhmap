import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';

const ProtectedRoute = ({ children, requiredUserType }) => {
  const { currentUser, userType, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredUserType && userType !== requiredUserType) {
    const redirectPath = userType === 'master' ? '/master/dashboard' : '/client/map';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
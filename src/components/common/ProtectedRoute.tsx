import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user role is not allowed, redirect to appropriate dashboard
  if (!allowedRoles.includes(user.role)) {
    const redirectPath = 
      user.role === UserRole.ADMIN 
        ? '/admin/dashboard' 
        : user.role === UserRole.DOCTOR 
          ? '/doctor/dashboard' 
          : '/patient/dashboard';
          
    return <Navigate to={redirectPath} replace />;
  }

  // If user is logged in and has the correct role, show the protected route
  return <>{children}</>;
};

export default ProtectedRoute;
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Make sure you have 'jwt-decode' installed: npm install jwt-decode

const useAuth = () => {
  const token = localStorage.getItem('token');
  if (!token) return { isAuthenticated: false, role: null };

  try {
    const decoded = jwtDecode(token);
    // Assuming your JWT payload has a 'role' field (e.g., { userId: '...', role: 'admin', ... })
    return { isAuthenticated: true, role: decoded.role };
  } catch (error) {
    console.error("Failed to decode token:", error);
    return { isAuthenticated: false, role: null };
  }
};

const ProtectedRoute = ({ requiredRole }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />; // Redirect to login if not authenticated
  if (requiredRole && role !== requiredRole) return <Navigate to="/dashboard" replace />; // Redirect if role doesn't match

  return <Outlet />; // Render the child routes if authenticated and authorized
};

export default ProtectedRoute;
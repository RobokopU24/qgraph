import { Redirect, useLocation } from 'react-router-dom';
import React, { useContext } from 'react';
import { useAuth } from '~/context/AuthContext';
import AlertContext from '~/context/alert';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const displayAlert = useContext(AlertContext);

  if (loading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    displayAlert('error', 'You must be logged in to access this page.');
    return (
      <Redirect to="/" state={{ from: location }} replace />
    );
  }

  return children;
};

export default ProtectedRoute;

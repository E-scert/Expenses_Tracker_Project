import React from 'react';
import { Navigate } from 'react-router-dom';
import { useActiveUser } from '../context/UserContext.jsx';

export default function RequireUser({ children }) {
  const { activeUser } = useActiveUser();
  if (!activeUser) return <Navigate to="/login" replace />;
  return children;
}

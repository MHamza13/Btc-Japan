import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { encryptStorage } from './utils/storage';
import { useSelector } from 'react-redux';

function AuthenticatedRoute() {
  const getToken = encryptStorage.getItem('b68f38dbe5a2');
  return getToken ? <Outlet /> : <Navigate to="/login" />;
}

export function ProtectedAdminTypeRoute({ superadmin, admin, agentstock, agentsales, mainAdmin }) {
  const userData = useSelector((state) => state.user.user);
  const userRole = userData?.userRole;

  return (
    <>
      {superadmin === userRole || admin === userRole || agentstock === userRole || agentsales === userRole || mainAdmin === userRole ? (
        <Outlet />
      ) : (
        <Navigate to="/" />
      )}
    </>
  );
}

export default AuthenticatedRoute;

import { lazy } from 'react';
// project imports
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';
import { encryptStorage } from './../utils/storage';
import { Navigate } from 'react-router';
// login option 3 routing
const AuthLogin3 = Loadable(lazy(() => import('views/pages/authentication/authentication3/Login3')));
const AuthRegister3 = Loadable(lazy(() => import('views/pages/authentication/authentication3/Register3')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const token = encryptStorage.getItem('b68f38dbe5a2');

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: 'login/',
      element: !token ? <AuthLogin3 />  : <Navigate to="/" />
    },
    {
      path: 'register/',
      element: !token ? <AuthRegister3 /> : <Navigate to="/" />
    }
  ]
};

export default AuthenticationRoutes;

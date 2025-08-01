import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import AuthenticatedRoute, { ProtectedAdminTypeRoute } from 'AuthenticatedRoute';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// Car routing
const Cars = Loadable(lazy(() => import('views/cars')));
const CarListing = Loadable(lazy(() => import('views/cars/Listing')));
const CarExpenses = Loadable(lazy(() => import('views/cars/Expenses')));
const SalesListing = Loadable(lazy(() => import('views/cars/SalesListing')));
const CarAdd = Loadable(lazy(() => import('views/cars/Add')));
const InStock = Loadable(lazy(() => import('views/cars/Instock')));
const Category = Loadable(lazy(() => import('views/cars/Category')));
const AddCategory = Loadable(lazy(() => import('views/cars/AddCategory')));
const CarDetails = Loadable(lazy(() => import('views/cars/CarDetails')));

// Station routing

const Station = Loadable(lazy(() => import('views/station')));
const StationListing = Loadable(lazy(() => import('views/station/listing')));
const StationAdd = Loadable(lazy(() => import('views/station/add')));

// Vendors routing
const Vendors = Loadable(lazy(() => import('views/vendor')));
const VendorsListing = Loadable(lazy(() => import('views/vendor/Listing')));
const VendorsAdd = Loadable(lazy(() => import('views/vendor/Add')));
const VendorsDetails = Loadable(lazy(() => import('views/vendor/VendorDetails')));
const VendersProfile = Loadable(lazy(() => import('views/vendor/VendersProfile')));
const ViewVendorLedgerDetails = Loadable(lazy(() => import('views/vendor/ViewVendorLedgerDetails')));
  
// Customers routing
const Customers = Loadable(lazy(() => import('views/Customers')));
const CustomersListing = Loadable(lazy(() => import('views/Customers/Listing')));
const CustomersAdd = Loadable(lazy(() => import('views/Customers/Add')));
const CustomerDeetails = Loadable(lazy(() => import('views/Customers/CustomerDeetails')));
const CustomersProfile = Loadable(lazy(() => import('views/Customers/CustomersProfile')));
const Customersledger = Loadable(lazy(() => import('views/Customers/ViewLedgerDetails')));
// Staff routing
const Staff = Loadable(lazy(() => import('views/staff')));
const StaffListing = Loadable(lazy(() => import('views/staff/Listing')));
const StaffAttendace = Loadable(lazy(() => import('views/staff/Attendace')));
const StaffSalary = Loadable(lazy(() => import('views/staff/Salary')));
const StaffAdd = Loadable(lazy(() => import('views/staff/Add')));

// Reminder routing
const ReminderBulk = Loadable(lazy(() => import('views/ReminderBulk/ReminderBulk')));

// Reports routing
const Reports = Loadable(lazy(() => import('views/pages/Reports')));
const BillBook = Loadable(lazy(() => import('views/pages/BillBook')));

// User routing
const UserListing = Loadable(lazy(() => import('views/users/Listing')));
const Users = Loadable(lazy(() => import('views/users')));
const UserAdd = Loadable(lazy(() => import('views/users/Add')));

// dashboard routing
const ChangePassword = Loadable(lazy(() => import('views/pages/ChangePassword')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  element: <AuthenticatedRoute />,
  children: [
    {
      element: <MainLayout />,
      children: [
        {
          path: '/',
          element: <DashboardDefault />
        },
        {
          path: 'dashboard',
          element: <DashboardDefault />
        },
        {
          path: 'user',
          element: (
            <ProtectedAdminTypeRoute mainAdmin="MainAdmin" superadmin="SuperAdmin">
              <Users />
            </ProtectedAdminTypeRoute>
          ),
          children: [
            {
              path: 'listing',
              element: <UserListing />
            },
            {
              path: 'add',
              element: <UserAdd />
            }
          ]
        },
        {
          path: 'changePassword',
          element: <ChangePassword />
        },
        {
          path: 'vehicles',
          element: <Cars />,
          children: [
            {
              path: 'listing',
              element: <CarListing />
            },
            {
              path: 'details/:id',
              element: <CarDetails />
            },
            {
              path: 'expenses',
              element: <CarExpenses />
            },
            {
              path: 'instock',
              element: <InStock />
            },
            {
              path: 'soldout',
              element: <SalesListing />
            },
            {
              path: 'category',
              element: <Category />
            },
            {
              path: 'add-category',
              element: <AddCategory />
            },
            {
              path: 'category/edit/:id',
              element: <AddCategory />
            },
            {
              path: 'add',
              element: <CarAdd />
            },
            {
              path: 'edit/:id',
              element: <CarAdd />
            }
          ]
        },
        {
          path: 'station',
          element: <Station />,
          children: [
            {
              path: 'listing',
              element: <StationListing />
            },
            {
              path: 'add',
              element: <StationAdd />
            },
            {
              path: 'add/:id',
              element: <StationAdd />
            }
          ]
        },
        {
          path: 'vendor',
          element: (
            <ProtectedAdminTypeRoute mainAdmin="MainAdmin" superadmin="SuperAdmin" admin="Admin" agentstock="AgentStock">
              <Vendors />
            </ProtectedAdminTypeRoute>
          ),
          children: [
            {
              path: 'listing',
              element: <VendorsListing />
            },
            {
              path: 'add',
              element: <VendorsAdd />
            },
            {
              path: 'edit/:id',
              element: <VendorsAdd />
            },
            {
              path: 'details/:id',
              element: <VendorsDetails />
            },
            {
              path: 'profile/:id',
              element: <VendersProfile />
            },
            {
              path: 'Ledger/:id',
              element: <ViewVendorLedgerDetails />
            }
          ]
        },
        {
          path: 'customer',
          element: (
            <ProtectedAdminTypeRoute mainAdmin="MainAdmin" superadmin="SuperAdmin" admin="Admin" agentsales="AgentSales">
              <Customers />
            </ProtectedAdminTypeRoute>
          ),
          children: [
            {
              path: 'listing',
              element: <CustomersListing />
            },
            {
              path: 'add',
              element: <CustomersAdd />
            },
            {
              path: 'details/:id',
              element: <CustomerDeetails />
            },
            {
              path: 'edit/:id',
              element: <CustomersAdd />
            },
            {
              path: 'profile/:id',
              element: <CustomersProfile />
            },
            {
              path: 'ledger/:id',
              element: <Customersledger />
            }
          ]
        },
        {
          path: 'staff',
          element: (
            <ProtectedAdminTypeRoute mainAdmin="MainAdmin" superadmin="SuperAdmin" admin="Admin">
              <Staff />
            </ProtectedAdminTypeRoute>
          ),
          children: [
            {
              path: 'listing',
              element: <StaffListing />
            },
            {
              path: 'attendace',
              element: <StaffAttendace />
            },
            {
              path: 'salary',
              element: <StaffSalary />
            },
            {
              path: 'add',
              element: <StaffAdd />
            },
            {
              path: 'edit/:id',
              element: <StaffAdd />
            }
          ]
        },
        {
          path: 'reminder',
          element: <ReminderBulk />
        },
        {
          path: 'reports',
          element: <Reports />
        },
        {
          path: 'bill-book',
          element: <BillBook />
        }
      ]
    }
  ]
};

export default MainRoutes;

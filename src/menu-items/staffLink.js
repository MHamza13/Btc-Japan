// assets
import { IconPoint, IconPlus } from '@tabler/icons';

// constant
const icons = {
  IconPoint,
  IconPlus
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const staffLink = {
  id: 'staffLink',
  title: 'Staff',
  caption: '',
  type: 'group',
  superAdmin: 'SuperAdmin',
  mainAdmin: 'MainAdmin',
  admin: 'Admin',
  allRole: 'All',
  children: [
    {
      id: 'StaffListing',
      title: 'Staff',
      type: 'item',
      url: '/staff/listing',
      icon: icons.IconPoint,
      breadcrumbs: false,
      superAdmin: 'SuperAdmin',
      mainAdmin: 'MainAdmin',
      admin: 'Admin',
      allRole: 'All',
      agentStock: 'AgentStock',
      agentSales: 'AgentSales'
    },
    {
      id: 'StaffAttendace',
      title: 'Attendace',
      type: 'item',
      url: '/staff/attendace',
      icon: icons.IconPoint,
      breadcrumbs: false,
      superAdmin: 'SuperAdmin',
      mainAdmin: 'MainAdmin',
      admin: 'Admin',
      allRole: 'All',
      agentStock: 'AgentStock',
      agentSales: 'AgentSales'
    },
    {
      id: 'StaffSalary',
      title: 'Salary',
      type: 'item',
      url: '/staff/salary',
      icon: icons.IconPoint,
      breadcrumbs: false,
      superAdmin: 'SuperAdmin',
      mainAdmin : "MainAdmin",
      admin: 'Admin',
      allRole: 'All',
      agentStock: 'AgentStock',
      agentSales: 'AgentSales'
    }
    // {
    //   id: 'AddStaff',
    //   title: 'Add Staff',
    //   type: 'item',
    //   url: '/staff/add',
    //   icon: icons.IconPlus
    // }
  ]
};

export default staffLink;

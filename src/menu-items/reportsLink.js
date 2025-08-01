// assets
import { IconPoint } from '@tabler/icons';

// constant
const icons = {
  IconPoint
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const reportsLink = {
  id: 'reportsLink',
  title: 'Reports',
  caption: '',
  type: 'group',
  superAdmin: 'SuperAdmin',
  mainAdmin : "MainAdmin",
  admin: 'Admin',
  allRole: 'All',
  agentStock: 'AgentStock',
  agentSales: 'AgentSales',
  children: [
    {
      id: 'reports',
      title: 'Reports',
      type: 'item',
      url: '/reports',
      icon: icons.IconPoint,
      breadcrumbs: false,
      superAdmin: 'SuperAdmin',
      mainAdmin : "MainAdmin",
    },
    {
      id: 'BillBook',
      title: 'Bill Book',
      type: 'item',
      url: '/bill-book',
      icon: icons.IconPoint,
      superAdmin: 'SuperAdmin',
      mainAdmin : "MainAdmin",
      admin: 'Admin',
      allRole: 'All',
      agentStock: 'AgentStock',
      agentSales: 'AgentSales',
    }
  ]
};

export default reportsLink;

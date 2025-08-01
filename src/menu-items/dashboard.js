// assets
import { IconDashboard } from '@tabler/icons';

// constant
const icons = { IconDashboard };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
  id: 'dashboard',
  title: 'Dashboard',
  type: 'group',
  superAdmin: 'SuperAdmin',
  mainAdmin: 'MainAdmin',  
  admin: 'Admin',
  allRole: 'All',
  agentStock: 'AgentStock',
  agentSales: 'AgentSales',
  children: [
    {
      id: 'default',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false,
      superAdmin: 'SuperAdmin',
      mainAdmin: 'MainAdmin',  
      admin: 'Admin',
      allRole: 'All',
      agentStock: 'AgentStock',
      agentSales: 'AgentSales',
    }
  ]
};

export default dashboard;

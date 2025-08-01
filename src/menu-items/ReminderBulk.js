// assets
import { IconPoint, IconPlus } from '@tabler/icons';

// constant
const icons = {
  IconPoint,
  IconPlus
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const ReminderBulk = {
  id: 'Reminder',
  title: 'Reminder',
  caption: '',
  type: 'group',
  superAdmin: 'SuperAdmin',
  mainAdmin: 'MainAdmin',
  admin: 'Admin',
  allRole: 'All',
  agentStock: 'AgentStock',
  agentSales: 'AgentSales',
  children: [
    {
      id: 'vehiclesListing',
      title: 'Reminder Bulk',
      type: 'item',
      url: '/reminder',
      icon: icons.IconPoint,
      breadcrumbs: false,
      superAdmin: 'SuperAdmin',
      mainAdmin: 'MainAdmin',
      allRole: 'All'
    }
  ]
};

export default ReminderBulk;

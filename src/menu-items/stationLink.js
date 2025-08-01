// assets
import { IconPoint, IconPlus } from '@tabler/icons';

// constant
const icons = {
  IconPoint,
  IconPlus
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const stationLink = {
  id: 'stationLink',
  title: 'Station',
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
      id: 'stationLink',
      title: 'Station',
      type: 'item',
      url: '/station/listing',
      icon: icons.IconPoint,
      breadcrumbs: false,
      superAdmin: 'SuperAdmin',
      mainAdmin : "MainAdmin",
      allRole: 'All'
    }
  ]
};

export default stationLink;

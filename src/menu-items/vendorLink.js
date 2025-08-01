// assets
import { IconPoint, IconPlus } from '@tabler/icons';

// constant
const icons = {
  IconPoint,
  IconPlus
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const vendorLink = {
  id: 'vendorLink',
  title: 'vendors',
  caption: '',
  type: 'group',
  superAdmin: 'SuperAdmin',
  mainAdmin : "MainAdmin",
  admin: 'Admin',
  allRole: 'All',
  agentStock: 'AgentStock',
  children: [
    {
      id: 'vendorsListing',
      title: 'All Vendors',
      type: 'item',
      url: '/vendor/listing',
      icon: icons.IconPoint,
      breadcrumbs: false,
      superAdmin: 'SuperAdmin',
      mainAdmin : "MainAdmin",
      admin: 'Admin',
      allRole: 'All',
      agentStock: 'AgentStock',
      agentSales: 'AgentSales',
    }
    // {
    //   id: 'Addvendor',
    //   title: 'Add vendor',
    //   type: 'item',
    //   url: '/vendor/add',
    //   icon: icons.IconPlus
    // }
  ]
};

export default vendorLink;

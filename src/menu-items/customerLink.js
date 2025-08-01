// assets
import { IconPoint, IconPlus } from '@tabler/icons';

// constant
const icons = {
  IconPoint,
  IconPlus
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const customerLink = {
  id: 'customerLink',
  title: 'Customers',
  caption: '',
  type: 'group',
  superAdmin: 'SuperAdmin',
  mainAdmin : "MainAdmin",
  admin: 'Admin',
  allRole: 'All',
  agentSales: 'AgentSales',
  children: [
    {
      id: 'CustomersListing',
      title: 'All Customers',
      type: 'item',
      url: '/customer/listing',
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
    //   id: 'AddCustomer',
    //   title: 'Add Customer',
    //   type: 'item',
    //   url: '/customer/add',
    //   icon: icons.IconPlus
    // }
  ]
};

export default customerLink;

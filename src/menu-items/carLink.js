// assets
import { IconPoint, IconPlus } from '@tabler/icons';

// constant
const icons = {
  IconPoint,
  IconPlus
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const carLink = {
  id: 'carLink',
  title: 'General',
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
      title: 'All vehicles',
      type: 'item',
      url: '/vehicles/listing',
      icon: icons.IconPoint,
      breadcrumbs: false,
      superAdmin: 'SuperAdmin',
      mainAdmin: 'MainAdmin',
      allRole: 'All'
    },
    {
      id: 'vehiclesInStock',
      title: 'In Stock',
      type: 'item',
      url: '/vehicles/instock',
      icon: icons.IconPoint,
      superAdmin: 'SuperAdmin',
      mainAdmin: 'MainAdmin',
      admin: 'Admin',
      allRole: 'All',
      agentStock: 'AgentStock',
      agentSales: 'AgentSales'
    },
    {
      id: 'vehiclesSale',
      title: 'Sold Out',
      type: 'item',
      url: '/vehicles/soldout',
      icon: icons.IconPoint,
      superAdmin: 'SuperAdmin',
      mainAdmin: 'MainAdmin',
      admin: 'Admin',
      allRole: 'All',
      agentSales: 'AgentSales'
    },
    {
      id: 'vehiclesCategory',
      title: 'vehicles Category',
      type: 'item',
      url: '/vehicles/category',
      icon: icons.IconPoint,
      superAdmin: 'SuperAdmin',
      mainAdmin: 'MainAdmin',
      admin: 'Admin',
      allRole: 'All',
      agentSales: 'AgentSales'
    }
    // {
    //   id: 'AddCar',
    //   title: 'Add Car',
    //   type: 'item',
    //   url: '/car/add',
    //   icon: icons.IconPlus
    // }
  ]
};

export default carLink;

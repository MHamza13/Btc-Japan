// assets
import { IconPoint, IconPlus } from '@tabler/icons';

// constant
const icons = {
  IconPoint,
  IconPlus
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const userLinks = {
  id: 'userLinks',
  title: 'Users',
  caption: '',
  type: 'group',
  superAdmin: 'SuperAdmin',
  mainAdmin : "MainAdmin",
  children: [
    {
      id: 'userListing',
      title: 'Roles',
      type: 'item',
      url: '/user/listing',
      icon: icons.IconPoint,
      breadcrumbs: false,
      superAdmin: 'SuperAdmin',
      mainAdmin : "MainAdmin",
    }
  ]
};

export default userLinks;

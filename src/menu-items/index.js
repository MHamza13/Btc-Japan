import dashboard from './dashboard';
import carLink from './carLink';
import customerLink from './customerLink';
import staffLink from './staffLink';
import reportsLink from './reportsLink';
import userLinks from './userLinks';
import vendorLink from './vendorLink';
import stationLink from './stationLink';
import ReminderBulk from './ReminderBulk';
// import pages from './pages';
// import utilities from './utilities';
// import other from './other';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [dashboard, carLink, stationLink, vendorLink, customerLink, staffLink, ReminderBulk, reportsLink, userLinks]
};

export default menuItems;

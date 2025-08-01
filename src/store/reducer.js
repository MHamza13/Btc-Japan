import { combineReducers } from 'redux';

// Reducer imports
import customizationReducer from './customizationReducer';
import userReducer from './user/userReducer';
import countryReducer from './country/countryReducer';
import customerReducer from './customer/customerReducer';
import vendorReducer from './vendor/vendorReducer';
import carReducer from './car/carReducer';
import staffReducer from './staff/staffReducer';
import dashboardReducer from './dashboard/dashboardReducer';
import reportsReducer from './reports/reportsReducer';
import categoryReducer from './category/categoryReducer';
import stationReducer from './station/StationReducer';
import emailReducer from './email/emailReducer';
import alertReducer from './alert/alertReducer';
import reminderReducer from './reminder/reminderReducer';

// Combine reducers
const reducer = combineReducers({
  customization: customizationReducer,
  user: userReducer,
  countries: countryReducer,
  customer: customerReducer,
  vendor: vendorReducer,
  car: carReducer,
  staff: staffReducer,
  dashboard: dashboardReducer,
  reports: reportsReducer,
  category: categoryReducer,
  stations: stationReducer,
  email: emailReducer,
  alert: alertReducer,
  reminder: reminderReducer,
});

export default reducer;

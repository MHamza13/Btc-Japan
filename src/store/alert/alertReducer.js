import { TRIGGER_ALERT } from './alertActions';

const initialState = {
  alert: null
};

const alertReducer = (state = initialState, action) => {
  switch (action.type) {
    case TRIGGER_ALERT:
      return {
        ...state,
        alert: action.payload
      };
    default:
      return state;
  }
};

export default alertReducer;
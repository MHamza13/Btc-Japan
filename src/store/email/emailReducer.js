import {
    SEND_EMAIL_REMINDER_REQUEST,
    SEND_EMAIL_REMINDER_SUCCESS,
    SEND_EMAIL_REMINDER_FAILURE
  } from './emailActions';
  
  const initialState = {
    loading: false,
    error: null,
    lastSentEmail: null
  };
  
  const emailReducer = (state = initialState, action) => {
    switch (action.type) {
      case SEND_EMAIL_REMINDER_REQUEST:
        return {
          ...state,
          loading: true,
          error: null
        };
      case SEND_EMAIL_REMINDER_SUCCESS:
        return {
          ...state,
          loading: false,
          lastSentEmail: action.payload,
          error: null
        };
      case SEND_EMAIL_REMINDER_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload
        };
      default:
        return state;
    }
  };
  
  export default emailReducer;
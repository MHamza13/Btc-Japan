import axios from 'axios';
import Swal from 'sweetalert2';
import { apiURL } from 'utils/ApiUrls';
import { encryptStorage } from './../../utils/storage';

// Action types
export const SEND_EMAIL_REMINDER_REQUEST = 'SEND_EMAIL_REMINDER_REQUEST';
export const SEND_EMAIL_REMINDER_SUCCESS = 'SEND_EMAIL_REMINDER_SUCCESS';
export const SEND_EMAIL_REMINDER_FAILURE = 'SEND_EMAIL_REMINDER_FAILURE';

export const setLoading = (isLoading) => ({
  type: 'SET_LOADING', 
  payload: isLoading
});

export const sendEmailReminder = (emailData) => async (dispatch) => {
  dispatch({ type: SEND_EMAIL_REMINDER_REQUEST });
  dispatch(setLoading(true)); 

  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    if (!token) {
      throw new Error('Authentication token is missing');
    }

    const payload = {
      email: emailData.email,
      name: emailData.name,
      pendingAmount: emailData.pendingAmount,
      totalAmount: emailData.totalAmount, 
      currencySymbol: emailData.currencySymbol
    };

    const response = await axios.post(
      `${apiURL}Email/sendReminder`,
      payload,
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Headers': 'Content-Type',
          Authorization: `Bearer ${token}`
        }
      }
    );


    dispatch({
      type: SEND_EMAIL_REMINDER_SUCCESS,
      payload: response.data
    });

    dispatch(setLoading(false));
    return response.data;
  } catch (error) {
    console.error('Email sending error:', error); g
    dispatch({
      type: SEND_EMAIL_REMINDER_FAILURE,
      payload: error.message
    });
    dispatch(setLoading(false));

    Swal.fire({
      title: 'Error!',
      text: error.message || 'Failed to send email reminder',
      icon: 'error'
    });

    throw error; 
  }
};
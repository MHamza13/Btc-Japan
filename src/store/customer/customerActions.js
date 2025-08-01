// customerActions.js
import axios from 'axios';
import Swal from 'sweetalert2';
import { apiURL } from 'utils/ApiUrls';
import { encryptStorage } from './../../utils/storage';

// Action types
export const GETLIST = 'GETLIST';
export const EditGetList = 'EditGetList';
export const SET_LOADING = 'SET_LOADING';
export const LedgerList = 'LedgerList';
export const LedgerDetailsList = 'LedgerDetailsList';

export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading
});

export const fetchCustomerList = () => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const customerListData = await axios.get(apiURL + 'customer', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Headers': 'Content-Type',
        Authorization: `Bearer ${token}`
      }
    });
    // console.log(customerListData.data)
    dispatch({
      type: GETLIST,
      payload: customerListData.data
    });
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error,
      icon: 'error'
    });
  }
};

export const addCustomer = (customerData, navigate) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  dispatch(setLoading(true));
  try {
    await axios
      .post(apiURL + 'customer/addedit?Id=0', customerData, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'multipart/form-data',
          'Access-Control-Allow-Headers': 'Content-Type',
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        dispatch(setLoading(false));
        console.log(res.data);
        Swal.fire({
          title: 'Customer',
          text: 'Customer Added Successfully',
          icon: 'success'
        });
        navigate('/customer/listing', { replace: true });
      });
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error,
      icon: 'error'
    });
  }
};

export const fetchEditCustomerList = (id) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const customerEditListData = await axios.get(apiURL + 'customer?Id=' + id, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Headers': 'Content-Type',
        Authorization: `Bearer ${token}`
      }
    });
    console.log(customerEditListData.data[0]);
    dispatch({
      type: EditGetList,
      payload: customerEditListData.data
    });
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error,
      icon: 'error'
    });
  }
};

export const updateCustomer = (id, customerData, navigate) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  dispatch(setLoading(true));
  try {
    await axios
      .put(apiURL + `customer/update/${id}`, customerData, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'multipart/form-data',
          'Access-Control-Allow-Headers': 'Content-Type',
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        dispatch(setLoading(false));
        console.log(res.data);
        dispatch(fetchCustomerList());
        Swal.fire({
          title: 'Customer',
          text: 'Customer Updated Successfully',
          icon: 'success'
        });
        navigate('/customer/listing', { replace: true });
      });
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error,
      icon: 'error'
    });
  }
};

export const customerDelete = (id) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    Swal.fire({
      title: 'Delete',
      text: 'You want to delete this Customer',
      icon: 'question',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Yes',
      denyButtonText: `No`
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(setLoading(true));
        axios
          .post(
            apiURL + 'customer/delete',
            { id: id },
            {
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'multipart/form-data',
                'Access-Control-Allow-Headers': 'Content-Type',
                Authorization: `Bearer ${token}`
              }
            }
          )
          .then(() => {
            dispatch(fetchCustomerList());
            dispatch(setLoading(false));
            Swal.fire({
              title: 'Deleted!',
              text: 'Customer Deleted Successfully',
              icon: 'success'
            });
          });
      }
    });
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error,
      icon: 'error'
    });
  }
};

//Ledger List Function
export const fetchLedgerList = (customerID) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const ledgerListData = await axios.get(apiURL + 'customer/allpurchases?Id=' + customerID, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Headers': 'Content-Type',
        Authorization: `Bearer ${token}`
      }
    });
    // console.log(ledgerListData.data)
    dispatch({
      type: LedgerList,
      payload: ledgerListData.data
    });
    dispatch(setLoading(false));
    return ledgerListData.data;
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error,
      icon: 'error'
    });
  }
};

//Ledger Details List Function
export const fetchLedgerDetailsList = (ledgerID) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const ledgerDetailsListData = await axios.get(apiURL + 'customer/ledger?Id=' + ledgerID, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Headers': 'Content-Type',
        Authorization: `Bearer ${token}`
      }
    });
    console.log(ledgerDetailsListData.data);
    dispatch({
      type: LedgerDetailsList,
      payload: ledgerDetailsListData.data
    });
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error,
      icon: 'error'
    });
  }
};

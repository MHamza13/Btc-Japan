import axios from 'axios';
import Swal from 'sweetalert2';
import { apiURL } from 'utils/ApiUrls';
import { encryptStorage } from './../../utils/storage';

// Action types
export const VendorList = 'VendorList';
export const VendorMoveList = 'VendorMoveList';
export const EditVendorList = 'EditVendorList';
export const VendorLedgerList = 'VendorLedgerList';
export const SET_LOADING = 'SET_LOADING';
export const LedgerDetailsList = 'LedgerDetailsList';

export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading,
});

export const fetchVendorList = () => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const vendorListData = await axios.get(`${apiURL}vendor`, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({
      type: VendorList,
      payload: vendorListData.data,
    });
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.title || 'Failed to fetch vendors',
      icon: 'error',
    });
  }
};

export const addVendor = (vendorData, navigate) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  dispatch(setLoading(true));
  try {
    const res = await axios.post(`${apiURL}vendor/addedit?Id=0`, vendorData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch(setLoading(false));
    console.log('Vendor Added:', res.data);
    Swal.fire({
      title: 'Success!',
      text: 'Vendor Added Successfully',
      icon: 'success',
    });
    navigate('/vendor/listing', { replace: true });
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.title || 'Failed to add vendor',
      icon: 'error',
    });
    console.error('Add Vendor Error:', error.response?.data);
  }
};

export const fetchEditVendorList = (id) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const customerEditListData = await axios.get(`${apiURL}vendor?Id=${id}`, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({
      type: EditVendorList,
      payload: customerEditListData.data[0],
    });
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.title || 'Failed to fetch vendor',
      icon: 'error',
    });
  }
};

export const fetchMoveVendorList = () => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const vendorListData = await axios.get(`${apiURL}vendor/getall`, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    const showroomData = vendorListData.data.filter((vendor) => vendor.type === 'showroom');
    dispatch({
      type: VendorMoveList,
      payload: showroomData,
    });
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.title || 'Failed to fetch move vendors',
      icon: 'error',
    });
  }
};

export const updateVendor = (id, vendorData, navigate) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  dispatch(setLoading(true));
  try {
    const res = await axios.put(`${apiURL}vendor/UpdateVendor/${id}`, vendorData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch(setLoading(false));
    console.log('Vendor Updated:', res.data);
    dispatch(fetchVendorList());
    Swal.fire({
      title: 'Success!',
      text: 'Vendor Updated Successfully',
      icon: 'success',
    });
    navigate('/vendor/listing', { replace: true });
  } catch (error) {
    dispatch(setLoading(false));
    const errorMessage =
      error.response?.data?.errors?.imageFile?.[0] ||
      error.response?.data?.title ||
      'Failed to update vendor';
    Swal.fire({
      title: 'Error!',
      text: errorMessage,
      icon: 'error',
    });
    console.error('Update Vendor Error:', error.response?.data);
  }
};

export const vendorDelete = (id) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    const result = await Swal.fire({
      title: 'Delete',
      text: 'Do you want to delete this Vendor?',
      icon: 'question',
      showDenyButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: 'No',
    });

    if (result.isConfirmed) {
      dispatch(setLoading(true));
      await axios.post(
        `${apiURL}vendor/delete`,
        { id: id },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(fetchVendorList());
      dispatch(setLoading(false));
      Swal.fire({
        title: 'Deleted!',
        text: 'Vendor Deleted Successfully',
        icon: 'success',
      });
    }
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.title || 'Failed to delete vendor',
      icon: 'error',
    });
  }
};

export const fetchVendorLedgerList = (id) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const vendorLedgerListData = await axios.get(`${apiURL}vendor/allpurchases?Id=${id}`, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({
      type: VendorLedgerList,
      payload: vendorLedgerListData.data,
    });
    dispatch(setLoading(false));
    return vendorLedgerListData.data;
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.title || 'Failed to fetch ledger',
      icon: 'error',
    });
  }
};

export const fetchLedgerDetailsList = (ledgerID) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const ledgerDetailsListData = await axios.get(`${apiURL}vendor/ledger?Id=${ledgerID}`, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({
      type: LedgerDetailsList,
      payload: ledgerDetailsListData.data,
    });
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.title || 'Failed to fetch ledger details',
      icon: 'error',
    });
  }
};
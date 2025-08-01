import axios from 'axios';
import Swal from 'sweetalert2';
import { apiURL } from 'utils/ApiUrls';
import { encryptStorage } from './../../utils/storage';

// Action types
export const StationList = 'StationList';
export const EditStation = 'EditStation';
export const SET_LOADING = 'SET_LOADING';

export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading,
});

// Fetch Station List Function (GET /api/Station)
export const fetchStationList = () => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const stationListData = await axios.get(`${apiURL}Station`, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Headers': 'Content-Type',
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({
      type: StationList,
      payload: stationListData.data,
    });
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.message || error.message || 'Failed to fetch stations',
      icon: 'error',
    });
  }
};

// Add Station Function (POST /api/Station/AddStation)
export const addStation = (stationData, navigate) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  dispatch(setLoading(true));
  try {
    console.log('Sending station data:', Object.fromEntries(stationData)); // Log FormData for debugging
    const response = await axios.post(`${apiURL}Station/AddStation`, stationData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'multipart/form-data', // For file upload
        'Access-Control-Allow-Headers': 'Content-Type',
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch(setLoading(false));
    console.log('API Response:', response.data); // Log server response
    Swal.fire({
      title: 'Station',
      text: 'Station Added Successfully',
      icon: 'success',
    });
    navigate('/station/listing', { replace: true });
  } catch (error) {
    dispatch(setLoading(false));
    console.error('Error posting station:', error.response?.data || error.message); // Detailed error logging
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.message || error.message || 'Failed to add station',
      icon: 'error',
    });
  }
};

export const fetchEditStation = (id) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const stationData = await axios.get(`${apiURL}Station/GetStatus/${id}`, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Headers': 'Content-Type',
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({
      type: EditStation,
      payload: stationData.data,
    });
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.message || error.message || 'Failed to fetch station',
      icon: 'error',
    });
  }
};

// Update Station Function (PUT /api/Station/UpdateStation/{id})
export const updateStation = (id, stationData, navigate) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  dispatch(setLoading(true));

  // Ensure id is included in FormData if required by the backend
  stationData.append('id', id); // Add this line to include id in the payload

  try {
    const response = await axios.put(`${apiURL}Station/UpdateStation/${id}`, stationData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Headers': 'Content-Type',
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch(setLoading(false));
    console.log('Update Response:', response.data);

    // Refresh station list after update
    dispatch(fetchStationList());

    Swal.fire({
      title: 'Station',
      text: 'Station Updated Successfully',
      icon: 'success',
    });
    navigate('/station/listing', { replace: true });
  } catch (error) {
    dispatch(setLoading(false));
    console.error('Update Station Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.message || error.message || 'Failed to update station',
      icon: 'error',
    });
  }
};

// Delete Station Function (DELETE /api/Station/Delete/{id})
export const deleteStation = (id) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    const result = await Swal.fire({
      title: 'Delete',
      text: 'Do you want to delete this station?',
      icon: 'question',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Yes',
      denyButtonText: 'No',
    });

    if (result.isConfirmed) {
      dispatch(setLoading(true));
      await axios.delete(`${apiURL}Station/DeleteStation/${id}`, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Headers': 'Content-Type',
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(fetchStationList());
      dispatch(setLoading(false));
      Swal.fire({
        title: 'Deleted!',
        text: 'Station Deleted Successfully',
        icon: 'success',
      });
    }
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.message || error.message || 'Failed to delete station',
      icon: 'error',
    });
  }
};
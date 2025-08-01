// carActions.js
import axios from 'axios';
import Swal from 'sweetalert2';
import { apiURL } from 'utils/ApiUrls';
import { encryptStorage } from './../../utils/storage';

// Action types
export const CarList = 'CarList';
export const EditCarList = 'EditCarList';
export const SET_LOADING = 'SET_LOADING';
export const ExpenseList = 'ExpenseList';
export const EditExList = 'EditExList';
export const TermPaymentsList = 'TermPaymentsList';
export const InStockCarList = 'InStockCarList';
export const salesCarList = 'salesCarList';

export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading
});

//Car List Function
export const fetchCarList = () => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const carListData = await axios.get(apiURL + 'car/GetAll', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Headers': 'Content-Type',
        Authorization: `Bearer ${token}`
      }
    });
    // console.log(carListData.data)
    dispatch({
      type: CarList,
      payload: carListData.data
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

//Car Instock List Function
export const fetchInstockCarList = () => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const carListData = await axios.get(apiURL + 'car/getinstockcars', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Headers': 'Content-Type',
        Authorization: `Bearer ${token}`
      }
    });
    // console.log(carListData.data)
    dispatch({
      type: InStockCarList,
      payload: carListData.data
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

//Car Sales List Function
export const fetchSalesCarList = () => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const carListData = await axios.get(apiURL + 'car/getsoldcars', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Headers': 'Content-Type',
        Authorization: `Bearer ${token}`
      }
    });
    // console.log(carListData.data)
    dispatch({
      type: salesCarList,
      payload: carListData.data
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

// Add Car Function
export const addCar = (carData, navigate) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  dispatch(setLoading(true));
  try {
    await axios
      .post(apiURL + 'car/addedit?Id=0', carData, {
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
          title: 'Car',
          text: 'Vehicles Added Successfully',
          icon: 'success'
        });
        navigate('/vehicles/listing', { replace: true });
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

// Edit Car List Function
export const fetchEditCarList = (id) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const carEditListData = await axios.get(apiURL + 'car/GetAll/' + id, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Headers': 'Content-Type',
        Authorization: `Bearer ${token}`
      }
    });
    console.log('API Response:', carEditListData.data);
    dispatch({
      type: EditCarList,
      payload: carEditListData.data
    });
    dispatch(setLoading(false));
  } catch (error) {
    console.error('Fetch Edit vehicles Error:', error);
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error.message || 'Failed to fetch car data',
      icon: 'error'
    });
  }
};

// Update Car Function
export const updateCar = (id, carData, navigate) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  dispatch(setLoading(true));
  try {
    await axios
      .put(apiURL + `car/updateCar/${id}`, carData, {
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
        dispatch(fetchCarList());
        Swal.fire({
          title: 'Car',
          text: 'Vehicles Updated Successfully',
          icon: 'success'
        });
        navigate('/vehicles/listing', { replace: true });
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

// Car Delete Function
export const carDelete = (id) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    Swal.fire({
      title: 'Delete',
      text: 'You want to delete this vehicles',
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
            apiURL + 'Car/delete',
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
            dispatch(fetchCarList());
            dispatch(fetchInstockCarList());
            dispatch(setLoading(false));
            Swal.fire({
              title: 'Deleted!',
              text: 'vehicles Deleted Successfully',
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

//Expense List Function
export const fetchExpenseList = (carID) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const expenseListData = await axios.get(apiURL + 'car/expenses?carId=' + carID, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Headers': 'Content-Type',
        Authorization: `Bearer ${token}`
      }
    });
    // console.log(expenseListData.data)
    dispatch({
      type: ExpenseList,
      payload: expenseListData.data
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

// Add Expense Function
export const addExpense = (expenseData, handleClose, carID) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    await axios
      .post(apiURL + 'car/addeditexpense?Id=0', expenseData, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'multipart/form-data',
          'Access-Control-Allow-Headers': 'Content-Type',
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        dispatch(fetchExpenseList(carID));
        dispatch(fetchCarList());
        dispatch(setLoading(false));
        console.log(res.data);
        Swal.fire({
          title: 'Added',
          text: 'Expense Added Successfully',
          icon: 'success'
        });
        handleClose();
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

// Expense Delete Function
export const expenseDelete = (id, carID) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    Swal.fire({
      title: 'Delete',
      text: 'You want to delete this Expense',
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
            apiURL + 'car/deleteexpense',
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
            dispatch(fetchExpenseList(carID));
            dispatch(fetchCarList());
            dispatch(setLoading(false));
            Swal.fire({
              title: 'Deleted!',
              text: 'Expense Deleted Successfully',
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

// Edit Expense List Function
export const fetchEditExpenseList = (id) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const expensesEditListData = await axios.get(apiURL + 'car/expenses?Id=' + id, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Headers': 'Content-Type',
        Authorization: `Bearer ${token}`
      }
    });
    // console.log(expensesEditListData.data[0])
    dispatch({
      type: EditExList,
      payload: expensesEditListData.data[0]
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

// Update Expense Function
export const updateExpense = (id, expenseData, handleClose, carID) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  dispatch(setLoading(true));
  try {
    await axios
      .post(apiURL + 'car/addeditexpense', expenseData, {
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
        dispatch(fetchExpenseList(carID));
        dispatch(fetchCarList());
        Swal.fire({
          title: 'Updated',
          text: 'Expense Updated Successfully',
          icon: 'success'
        });
        handleClose();
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

// Sale Car Function
export const addSaleCar = (saleData, handleClose) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    await axios
      .post(apiURL + 'car/sale', saleData, {
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
        dispatch(fetchCarList());
        Swal.fire({
          title: 'Sale',
          text: 'vehicles Sale Successfully',
          icon: 'success'
        });
        handleClose();
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

//Term Payments List Function
export const fetchTermPaymentsList = (carID) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const termPaymentsListData = await axios.get(apiURL + 'car/TermPayments?CarId=' + carID, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Headers': 'Content-Type',
        Authorization: `Bearer ${token}`
      }
    });
    // console.log(termPaymentsListData.data)
    dispatch({
      type: TermPaymentsList,
      payload: termPaymentsListData.data
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

// Add Expense Function
export const addTermPayment = (termPData, handleClose, carID) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    await axios
      .post(apiURL + 'car/AddTermPayment', termPData, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'multipart/form-data',
          'Access-Control-Allow-Headers': 'Content-Type',
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        dispatch(fetchCarList());
        dispatch(fetchTermPaymentsList(carID));
        dispatch(setLoading(false));
        console.log(res.data);
        Swal.fire({
          title: 'Added',
          text: 'Payment Added Successfully',
          icon: 'success'
        });
        handleClose();
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

// Update Location Function
export const updateCarLocation = (locationData, handleClose) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  dispatch(setLoading(true));
  try {
    await axios
      .post(apiURL + 'car/updatelocation', locationData, {
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
        dispatch(fetchCarList());
        Swal.fire({
          title: 'Updated',
          text: 'Location Updated Successfully',
          icon: 'success'
        });
        handleClose();
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

// Update Location Function
export const funcMoveCar = (moveData, handleClose) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  dispatch(setLoading(true));
  try {
    await axios
      .post(apiURL + 'car/move', moveData, {
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
        dispatch(fetchCarList());
        Swal.fire({
          title: 'Move',
          text: 'vehicles Move Successfully',
          icon: 'success'
        });
        handleClose();
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

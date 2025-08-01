import axios from 'axios';
import Swal from 'sweetalert2';
import { apiURL } from 'utils/ApiUrls';
import { encryptStorage } from './../../utils/storage';

// Action types
export const CategoryList = 'CategoryList';
export const EditCategory = 'EditCategory';
export const SET_LOADING = 'SET_LOADING';

export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading,
});

// Fetch Category List Function (GET /api/Category)
export const fetchCategoryList = () => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const categoryListData = await axios.get(`${apiURL}Category`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({
      type: CategoryList,
      payload: categoryListData.data,
    });
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error.message || 'Failed to fetch categories',
      icon: 'error',
    });
  }
};

// Add Category Function (POST /api/Category/AddCategory)
export const addCategory = (categoryData, navigate) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  dispatch(setLoading(true));
  try {
    const response = await axios.post(`${apiURL}Category/AddCategory`, categoryData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch(setLoading(false));
    console.log('API Response:', response.data);
    Swal.fire({
      title: 'Category',
      text: 'Category Added Successfully',
      icon: 'success',
    });
    navigate('/vehicles/category', { replace: true });
    return response.data; // Resolve the Promise
  } catch (error) {
    dispatch(setLoading(false));
    console.error('API Error:', error.response?.data || error.message);
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.message || error.message || 'Failed to add category',
      icon: 'error',
    });
    throw error; // Reject the Promise
  }
};

// Fetch Single Category for Editing (GET /api/Category/Category/{id})
export const fetchEditCategory = (id) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    dispatch(setLoading(true));
    const categoryData = await axios.get(`${apiURL}Category/Category/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({
      type: EditCategory,
      payload: categoryData.data, // Should be { id, categoryName, description, status, imagePath }
    });
    dispatch(setLoading(false));
    return { payload: categoryData.data }; // Return for Promise
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error.message || 'Failed to fetch category',
      icon: 'error',
    });
    throw error;
  }
};

// Update Category Function (PUT /api/Category/UpdateCategory/{id})
export const updateCategory = (id, categoryData, navigate) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  dispatch(setLoading(true));
  try {
    const response = await axios.put(`${apiURL}Category/UpdateCategory/${id}`, categoryData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch(setLoading(false));
    console.log('Update API Response:', response.data);
    dispatch(fetchCategoryList()); // Refresh the list after update
    Swal.fire({
      title: 'Category',
      text: 'Category Updated Successfully',
      icon: 'success',
    });
    navigate('/vehicles/category', { replace: true });
    return response.data; // Resolve the Promise
  } catch (error) {
    dispatch(setLoading(false));
    console.error('Update API Error:', error.response?.data || error.message);
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.message || error.message || 'Failed to update category',
      icon: 'error',
    });
    throw error; // Reject the Promise
  }
};

// Delete Category Function (DELETE /api/Category/Delete/{id})
export const deleteCategory = (id) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  try {
    const result = await Swal.fire({
      title: 'Delete',
      text: 'Do you want to delete this category?',
      icon: 'question',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Yes',
      denyButtonText: 'No',
    });

    if (result.isConfirmed) {
      dispatch(setLoading(true));
      await axios.delete(`${apiURL}Category/Delete/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(fetchCategoryList());
      dispatch(setLoading(false));
      Swal.fire({
        title: 'Deleted!',
        text: 'Category Deleted Successfully',
        icon: 'success',
      });
    }
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error.message || 'Failed to delete category',
      icon: 'error',
    });
  }
};
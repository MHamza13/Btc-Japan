import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Box, Grid, FormControl, InputLabel, OutlinedInput, Button, MenuItem, Select } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Swal from 'sweetalert2';
import { addCategory, fetchEditCategory, updateCategory } from '../../store/category/categoryAction';

const AddCategory = () => {
  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
    status: '',
    image: null
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams(); // Get the ID from the URL (e.g., /car/category/edit/:id)
  const isEditMode = !!id; // True if ID exists, meaning we're editing

  // Fetch category data for editing when ID is present
  useEffect(() => {
    if (isEditMode) {
      console.log('Fetching category with ID:', id); // Debug ID
      dispatch(fetchEditCategory(id))
        .then((response) => {
          const category = response.payload;
          setFormData({
            categoryName: category.categoryName || '',
            description: category.description || '',
            status: category.status || '',
            image: null // Image isn’t preloaded; user must re-upload if changing
          });
          console.log('Fetched Category for Edit:', category);
        })
        .catch((error) => {
          console.error('Error fetching category:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to load category data',
            icon: 'error'
          });
        });
    }
  }, [dispatch, id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({ ...prevData, image: file }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.categoryName) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please enter a category name',
        icon: 'warning'
      });
      return;
    }
    if (!formData.status) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please select a status',
        icon: 'warning'
      });
      return;
    }
    if (!isEditMode && !formData.image) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please upload an image',
        icon: 'warning'
      });
      return;
    }

    const categoryData = new FormData();
    // Simplify FormData structure; backend might expect flat fields or a specific model
    categoryData.append('CategoryName', formData.categoryName || '');
    categoryData.append('Description', formData.description || '');
    categoryData.append('Status', formData.status || '');
    if (isEditMode) {
      categoryData.append('Id', id); // Explicitly send ID for update
    }
    if (formData.image) {
      categoryData.append('imageFile', formData.image); // Only append if new image
    }

    // Log FormData entries for debugging
    console.log('Submitting with ID:', id);
    for (let [key, value] of categoryData.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    if (isEditMode) {
      // Update existing category
      dispatch(updateCategory(id, categoryData, navigate))
        .then(() => {
          console.log('Category updated successfully');
          Swal.fire({
            title: 'Success!',
            text: 'Category updated successfully',
            icon: 'success'
          });
        })
        .catch((error) => {
          console.error('Error updating category:', error.response?.data || error.message);
          Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message || error.message || 'Failed to update category',
            icon: 'error'
          });
        });
    } else {
      // Add new category
      dispatch(addCategory(categoryData, navigate))
        .then(() => {
          console.log('Category added successfully');
          Swal.fire({
            title: 'Success!',
            text: 'Category added successfully',
            icon: 'success'
          });
        })
        .catch((error) => {
          console.error('Error adding category:', error.response?.data || error.message);
          Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message || error.message || 'Failed to add category',
            icon: 'error'
          });
        });
    }
  };

  const inputFields = [
    { name: 'categoryName', label: 'Category Name', type: 'text' },
    { name: 'description', label: 'Description', type: 'text' }
  ];

  return (
    <MainCard
      title={
        isEditMode ? (
          <p
            style={{
              margin: 0,
              fontSize: '1.5rem',
              color: '#121926',
              fontWeight: 700,
              fontFamily: "'Roboto', sans-serif",
              flex: '1 1 100%'
            }}
          >
            Edit Category
          </p>
        ) : (
          <p
            style={{
              margin: 0,
              fontSize: '1.5rem',
              color: '#121926',
              fontWeight: 700,
              fontFamily: "'Roboto', sans-serif",
              flex: '1 1 100%'
            }}
          >
            Add New Category
          </p>
        )
      }
    >
      <Container>
        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {inputFields.map(({ name, label, type }, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <FormControl fullWidth>
                  <InputLabel>{label}</InputLabel>
                  <OutlinedInput
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    label={label}
                    type={type}
                    required={name === 'categoryName'}
                  />
                </FormControl>
              </Grid>
            ))}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={formData.status} onChange={handleChange} label="Status" required>
                  <MenuItem value="">
                    <em>Select Status</em>
                  </MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <input type="file" id="upload-input" style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
                <Box
                  onClick={() => document.getElementById('upload-input').click()}
                  sx={{
                    border: '2px solid #ccc',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '9px 10px',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': { borderColor: '#1976d2' }
                  }}
                >
                  <CloudUploadIcon fontSize="medium" />
                  <span>Upload icons</span>
                  {formData.image && <span style={{ marginLeft: '10px' }}>{formData.image.name}</span>}
                </Box>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} sx={{ textAlign: 'right' }}>
              <Button size="large" type="submit" variant="contained" color="secondary">
                {isEditMode ? 'Update' : 'Add Category'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </MainCard>
  );
};

export default AddCategory;

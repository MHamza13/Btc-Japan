import React, { useEffect, useState, useRef } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import {
  Container,
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  Autocomplete,
  TextField,
  Typography
} from '@mui/material';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCountryList, fetchCurrenciesList } from 'store/country/countryActions';
import { useNavigate, useParams } from 'react-router';
import { addVendor, fetchEditVendorList, updateVendor } from 'store/vendor/vendorActions';
import BackDropLoading from 'views/utilities/BackDropLoading';
import Swal from 'sweetalert2';
import { imageUrl } from 'utils/ApiUrls';

// Validation schema
const validation = yup.object({
  title: yup.string().required('Title is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  countryId: yup.string().required('Country is required'),
  currency: yup.string().required('Currency is required'),
  city: yup.string().required('City is required')
});

function VendorsAdd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const countryList = useSelector((state) => state.countries.list || []);
  const editVendorList = useSelector((state) => state.vendor.vEditList || {});
  const currenciesList = useSelector((state) => state.countries.currenciesList || []);
  const userData = useSelector((state) => state.user.user || {});
  const loading = useSelector((state) => state.vendor.loading || false);

  const [country, setCountry] = useState(null);
  const [dpPreview, setDpPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCountryList());
    dispatch(fetchCurrenciesList());
    if (id) {
      dispatch(fetchEditVendorList(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (countryList.length > 0) {
      if (id && editVendorList.countryId) {
        const selectedCountry = countryList.find((c) => c.id === editVendorList.countryId) || null;
        setCountry(selectedCountry);
      } else if (!id && userData.userRole !== 'SuperAdmin' && userData.countryId) {
        const defaultCountry = countryList.find((c) => c.id === userData.countryId) || null;
        setCountry(defaultCountry);
      } else {
        setCountry(null);
      }
    }
  }, [countryList, editVendorList, id, userData]);

  useEffect(() => {
    if (id && editVendorList.frontCard) {
      setDpPreview(`${imageUrl}Vendor/${editVendorList.frontCard}`.replace(/\\/g, '/'));
    } else {
      setDpPreview(null);
    }
  }, [editVendorList, id]);

  const formik = useFormik({
    enableReinitialize: true,
    validateOnMount: true,
    initialValues: {
      Id: id ? `${id}` : 0,
      title: id ? `${editVendorList.title || ''}` : '',
      email: id ? `${editVendorList.email || ''}` : '',
      advanceAmount: id ? `${editVendorList.advanceAmount || ''}` : '',
      currency: id ? `${editVendorList.currency || ''}` : country ? country.currency : '',
      contactNumber: id ? `${editVendorList.contactNumber || ''}` : '',
      countryId: id ? `${editVendorList.countryId || ''}` : country ? country.id : '',
      address: id ? `${editVendorList.address || ''}` : '',
      city: id ? `${editVendorList.city || ''}` : '',
      CardFront: '',
      frontCard: id ? editVendorList.frontCard || '' : ''
    },
    validationSchema: validation,
    onSubmit: (values, { setSubmitting }) => {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('id', values.Id);
      formData.append('title', values.title);
      formData.append('address', values.address || '');
      formData.append('contactNumber', values.contactNumber || '');
      formData.append('email', values.email);
      formData.append('countryId', values.countryId || null);
      formData.append('currency', values.currency);
      formData.append('advanceAmount', values.advanceAmount || 0);
      formData.append('city', values.city);

      if (id) {
        if (values.CardFront) {
          formData.append('imageFile', values.CardFront);
        } else if (values.frontCard) {
          formData.append('imageFile', values.frontCard);
        }
        console.log('Update FormData:', Object.fromEntries(formData));
        dispatch(updateVendor(id, formData, navigate));
      } else {
        if (values.CardFront) {
          formData.append('imageFile', values.CardFront);
        }
        console.log('Add FormData:', Object.fromEntries(formData));
        dispatch(addVendor(formData, navigate));
      }

      setSubmitting(false);
    }
  });

  const handleCountryChange = (event, newValue) => {
    const selectedCountry = newValue || null;
    setCountry(selectedCountry);
    formik.setFieldValue('countryId', selectedCountry ? selectedCountry.id : '');
    formik.setFieldValue('currency', selectedCountry ? selectedCountry.currency : '');
    console.log('Selected Country:', selectedCountry);
  };

  const handleDpChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      formik.setFieldValue('CardFront', file);
      const previewUrl = URL.createObjectURL(file);
      setDpPreview(previewUrl);
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Please select a PNG or JPEG image.',
        icon: 'error'
      });
    }
  };

  const handleDpClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    return () => {
      if (dpPreview && !id) {
        URL.revokeObjectURL(dpPreview);
      }
    };
  }, [dpPreview, id]);

  return (
    <>
      {loading && <BackDropLoading />}
      <MainCard
        title={
          id ? (
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
              Edit Vendor
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
              Add New Vendor
            </p>
          )
        }
      >
        <Container>
          <Box
            component="form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              formik.handleSubmit(e);
            }}
            autoComplete="off"
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth error={Boolean(formik.touched.countryId && formik.errors.countryId)}>
                  <Autocomplete
                    id="countryId"
                    name="countryId"
                    disablePortal
                    fullWidth
                    value={country}
                    onChange={handleCountryChange}
                    options={countryList}
                    getOptionLabel={(option) => option.name || ''}
                    renderInput={(params) => <TextField {...params} label="Select Country" />}
                    disabled={userData.userRole === 'SuperAdmin' ? false : true}
                  />
                  {formik.touched.countryId && formik.errors.countryId && (
                    <FormHelperText error id="standardcountryId">
                      {formik.errors.countryId}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth error={Boolean(formik.touched.city && formik.errors.city)}>
                  <InputLabel htmlFor="city">City</InputLabel>
                  <OutlinedInput
                    id="city"
                    type="text"
                    value={formik.values.city}
                    name="city"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter City"
                  />
                  {formik.touched.city && formik.errors.city && (
                    <FormHelperText error id="standardcity">
                      {formik.errors.city}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth error={Boolean(formik.touched.title && formik.errors.title)}>
                  <InputLabel htmlFor="title">Name</InputLabel>
                  <OutlinedInput
                    id="title"
                    type="text"
                    value={formik.values.title}
                    name="title"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter Title"
                  />
                  {formik.touched.title && formik.errors.title && (
                    <FormHelperText error id="standardtitle">
                      {formik.errors.title}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="advanceAmount">Deposit Amount</InputLabel>
                  <OutlinedInput
                    id="advanceAmount"
                    type="number"
                    value={formik.values.advanceAmount}
                    name="advanceAmount"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Deposit Amount"
                    onKeyPress={(event) => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="contactNumber">Phone Number</InputLabel>
                  <OutlinedInput
                    id="contactNumber"
                    type="text"
                    value={formik.values.contactNumber}
                    name="contactNumber"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter Contact Number"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth error={Boolean(formik.touched.email && formik.errors.email)}>
                  <InputLabel htmlFor="email">Email</InputLabel>
                  <OutlinedInput
                    id="email"
                    type="email"
                    value={formik.values.email}
                    name="email"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter Email"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <FormHelperText error id="standardemail">
                      {formik.errors.email}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth error={Boolean(formik.touched.currency && formik.errors.currency)}>
                  <InputLabel id="currency">Select Currency</InputLabel>
                  <Select
                    labelId="currency"
                    id="currency"
                    name="currency"
                    value={formik.values.currency}
                    label="Select Currency"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled
                  >
                    <MenuItem value="">
                      <em>Select Currency</em>
                    </MenuItem>
                    {currenciesList.map((item, i) => (
                      <MenuItem value={item.title} key={i}>
                        {item.title}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.currency && formik.errors.currency && (
                    <FormHelperText error id="standardcurrency">
                      {formik.errors.currency}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="address">Address</InputLabel>
                  <OutlinedInput
                    id="address"
                    type="text"
                    value={formik.values.address}
                    name="address"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter Address"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                {/* Hidden File Input */}
                <input
                  type="file"
                  id="CardFront"
                  name="CardFront"
                  accept="image/png, image/jpeg"
                  onChange={handleDpChange}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                {/* DP Preview and Selection */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '2px solid #ccc',
                      borderRadius: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f8fafc'
                    }}
                    onClick={handleDpClick}
                  >
                    {dpPreview || (id && editVendorList.frontCard) ? (
                      <img
                        src={
                          dpPreview ||
                          (id && editVendorList.frontCard
                            ? `${imageUrl}Vendor/${editVendorList.frontCard}`.replace(/\\/g, '/')
                            : '/default-dp.png')
                        }
                        alt="DP Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => (e.target.src = '/default-dp.png')}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#757575' , fontSize : "25px" }}>
                        Select DP
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={12} style={{ textAlign: 'right' }}>
                <Button
                  disableElevation
                  size="large"
                  type="submit"
                  variant="contained"
                  color="secondary"
                  disabled={formik.isSubmitting || !formik.isValid}
                >
                  {id ? 'Update' : 'Submit'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </MainCard>
    </>
  );
}

export default VendorsAdd;

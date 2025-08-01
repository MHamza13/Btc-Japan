import React, { useState, useEffect } from 'react';
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
  IconButton,
  InputAdornment,
  Autocomplete,
  TextField
} from '@mui/material';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCountryList, fetchCurrenciesList } from 'store/country/countryActions';
import { useNavigate, useParams } from 'react-router';
import moment from 'moment';
import Dropzone from 'react-dropzone';
import Swal from 'sweetalert2';
import { addCustomer, fetchEditCustomerList, updateCustomer } from 'store/customer/customerActions';
import BackDropLoading from 'views/utilities/BackDropLoading';
import { imageUrl } from 'utils/ApiUrls';
import { Person } from '@mui/icons-material';

// Validation Schema
const validation = yup.object({
  FirstName: yup.string('Enter FirstName').required('FirstName is required'),
  LastName: yup.string('Enter LastName').required('LastName is required'),
  Email: yup.string('Enter Email Address').email('Enter a valid email').required('Email is required'),
  currency: yup.string('Select Currency').required('Currency is required'),
  PhoneNumber: yup.string('Enter Phone Number').required('Phone Number is required'),
  Password: yup
    .string('Enter User password')
    .required('Password is required')
    .matches('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})', 'Must Contain 6 Characters, One Uppercase, One Lowercase, and One Number')
});

function CustomersAdd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentDate = moment();
  const [idFrontfile, setIdFrontfile] = useState();
  const [idBackfile, setIdBackfile] = useState();
  const [profileFile, setProfileFile] = useState();
  const [businessCardFile, setBusinessCardFile] = useState();
  const countryList = useSelector((state) => state.countries.list || []);
  const currenciesList = useSelector((state) => state.countries.currenciesList || []);
  const editCustomerList = useSelector((state) => state.customer.cEditList || {});
  const userData = useSelector((state) => state.user.user || {});
  const loading = useSelector((state) => state.customer.loading);
  const [showPassword, setShowPassword] = useState(false);

  // Initialize country state based on user role or edit data
  const [country, setCountry] = useState(() => {
    if (id && editCustomerList.countryId) {
      const selectedCountry = countryList.find((c) => c.id === editCustomerList.countryId);
      return selectedCountry || { id: 0, name: '' };
    }
    return {
      id: userData.userRole === 'SuperAdmin' ? 0 : userData.countryId || 0,
      name: userData.userRole === 'SuperAdmin' ? '' : userData.countryName || ''
    };
  });

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  useEffect(() => {
    dispatch(fetchCountryList());
    dispatch(fetchCurrenciesList());
    if (id) {
      dispatch(fetchEditCustomerList(id));
    }
  }, [dispatch, id]);

  // Update country state when countryList or editCustomerList changes
  useEffect(() => {
    if (id && editCustomerList.countryId && countryList.length > 0) {
      const selectedCountry = countryList.find((c) => c.id === editCustomerList.countryId);
      if (selectedCountry) {
        setCountry(selectedCountry);
      }
    }
  }, [id, editCustomerList.countryId, countryList]);

  const todayDate = currentDate.format('YYYY-MM-DD');

  const formik = useFormik({
    enableReinitialize: true, // Reinitialize only when editCustomerList changes
    validateOnMount: true,
    initialValues: {
      Id: id ? `${id}` : 0,
      FirstName: id ? `${editCustomerList.firstName || ''}` : '',
      LastName: id ? `${editCustomerList.lastName || ''}` : '',
      Email: id ? `${editCustomerList.email || ''}` : '',
      Whatsapp: id ? `${editCustomerList.whatsapp || ''}` : '',
      PhoneNumber: id ? `${editCustomerList.phoneNumber || ''}` : '',
      Password: id ? `${editCustomerList.password || ''}` : '',
      DateOfBirth: id ? `${editCustomerList.dateOfBirth || todayDate}` : `${todayDate}`,
      advanceAmount: id ? `${editCustomerList.advanceAmount || ''}` : '',
      BusinessName: id ? `${editCustomerList.businessName || ''}` : '',
      BusinessCard: id ? `${editCustomerList.businessCard || ''}` : '',
      Profile: '',
      BusinessType: id ? `${editCustomerList.businessType || ''}` : '',
      CountryId: id ? `${editCustomerList.countryId || ''}` : userData.userRole === 'SuperAdmin' ? '' : `${userData.countryId || ''}`,
      currency: id ? `${editCustomerList.currency || ''}` : userData.userRole === 'SuperAdmin' ? '' : `${userData.currency || ''}`,
      BusinessCountryId: id
        ? `${editCustomerList.businessCountryId || ''}`
        : userData.userRole === 'SuperAdmin'
        ? ''
        : `${userData.countryId || ''}`,
      Port: id ? `${editCustomerList.port || ''}` : '',
      ShippingMode: id ? `${editCustomerList.shippingMode || ''}` : '',
      TradeTerm: id ? `${editCustomerList.tradeTerm || ''}` : '',
      Address: id ? `${editCustomerList.address || ''}` : '',
      City: id ? `${editCustomerList.city || ''}` : '',
      ZipCode: id ? `${editCustomerList.zipCode || ''}` : '',
      BackCNIC: '',
      FrontCNIC: '',
      cnicBack: id ? `${editCustomerList.cnicBack || ''}` : '',
      cnicFront: id ? `${editCustomerList.cnicFront || ''}` : ''
    },
    validationSchema: validation,
    onSubmit: (values) => {
      const formData = new FormData();
      for (const key in values) {
        formData.append(key, values[key]);
      }
      if (id) {
        dispatch(updateCustomer(id, formData, navigate));
      } else {
        dispatch(addCustomer(formData, navigate));
      }
    }
  });

  // Sync CountryId with formik when country changes
  const handleCountryChange = (event, newValue) => {
    const selectedCountry = newValue || { id: 0, name: '' };
    setCountry(selectedCountry);
    formik.setFieldValue('CountryId', selectedCountry.id || '');
    formik.setFieldValue('BusinessCountryId', selectedCountry.id || '');
    // Optionally sync currency if country has a default currency
    if (selectedCountry.currency) {
      formik.setFieldValue('currency', selectedCountry.currency);
    }
  };

  // Dropzone Handlers
  const idCardFrontDrop = async (acceptedFiles) => {
    const imageFile = acceptedFiles[0];
    const image = new Image();
    image.src = URL.createObjectURL(imageFile);
    await new Promise((resolve) => (image.onload = resolve));
    if (!['image/jpeg', 'image/png'].includes(imageFile.type)) {
      Swal.fire({
        title: 'Error',
        text: 'Unsupported File Format. Please select a JPG or PNG image.',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      return;
    }
    setIdFrontfile(URL.createObjectURL(imageFile));
    formik.setFieldValue('FrontCNIC', imageFile);
  };

  const idCardBackDrop = async (acceptedFiles) => {
    const imageFile = acceptedFiles[0];
    const image = new Image();
    image.src = URL.createObjectURL(imageFile);
    await new Promise((resolve) => (image.onload = resolve));
    if (!['image/jpeg', 'image/png'].includes(imageFile.type)) {
      Swal.fire({
        title: '',
        text: 'Unsupported File Format. Please select a JPG or PNG image.',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      return;
    }
    setIdBackfile(URL.createObjectURL(imageFile));
    formik.setFieldValue('BackCNIC', imageFile);
  };

  const profileDrop = async (acceptedFiles) => {
    const imageFile = acceptedFiles[0];
    const image = new Image();
    image.src = URL.createObjectURL(imageFile);
    await new Promise((resolve) => (image.onload = resolve));
    if (!['image/jpeg', 'image/png'].includes(imageFile.type)) {
      Swal.fire({
        title: 'Error',
        text: 'Unsupported File Format. Please select a JPG or PNG image.',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      return;
    }
    setProfileFile(URL.createObjectURL(imageFile));
    formik.setFieldValue('Profile', imageFile);
  };

  const businessCardDrop = async (acceptedFiles) => {
    const imageFile = acceptedFiles[0];
    const image = new Image();
    image.src = URL.createObjectURL(imageFile);
    await new Promise((resolve) => (image.onload = resolve));
    if (!['image/jpeg', 'image/png'].includes(imageFile.type)) {
      Swal.fire({
        title: 'Error',
        text: 'Unsupported File Format. Please select a JPG or PNG image.',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      return;
    }
    setBusinessCardFile(URL.createObjectURL(imageFile));
    formik.setFieldValue('BusinessCard', imageFile);
  };

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
              Edit Customer
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
              Add New Customer
            </p>
          )
        }
      >
        <Container>
          <Box component="form" noValidate onSubmit={formik.handleSubmit} autoComplete="off">
            <Grid container spacing={2}>
              {/* Row 1: Profile Image (Circular) */}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <div className="file-select-main">
                  <Dropzone onDrop={profileDrop}>
                    {({ getRootProps, getInputProps }) => (
                      <div
                        style={{ borderRadius: '50%', width: '150px', height: '150px', objectFit: 'cover' }}
                        {...getRootProps()}
                        className="dropzone customer-id-image"
                      >
                        <input {...getInputProps()} />
                        {profileFile ? (
                          <img
                            src={profileFile}
                            alt="Profile"
                            style={{ borderRadius: '50%', width: '150px', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                          />
                        ) : editCustomerList.profile ? (
                          <img
                            src={`${imageUrl}Customers/${editCustomerList.profile}`}
                            alt="Profile"
                            style={{ borderRadius: '50%', width: '150px', height: '150px', objectFit: 'cover' }}
                          />
                        ) : (
                          <Box
                            sx={{
                              borderRadius: '50%',
                              width: '106px',
                              height: '180px'
                            }}
                          >
                            <Person sx={{ fontSize: '80px', color: '#757575', marginTop: '15px' }} />
                          </Box>
                        )}
                        <div className="dropzone-overly">
                          <p>Upload Profile Image</p>
                        </div>
                      </div>
                    )}
                  </Dropzone>
                </div>
              </Grid>

              {/* Row 2: Name, Email, Phone Number, WhatsApp */}
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth error={Boolean(formik.touched.FirstName && formik.errors.FirstName)}>
                  <InputLabel htmlFor="FirstName">First Name</InputLabel>
                  <OutlinedInput
                    id="FirstName"
                    type="text"
                    value={formik.values.FirstName}
                    name="FirstName"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter First Name"
                  />
                  {formik.touched.FirstName && formik.errors.FirstName && <FormHelperText error>{formik.errors.FirstName}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth error={Boolean(formik.touched.LastName && formik.errors.LastName)}>
                  <InputLabel htmlFor="LastName">Last Name</InputLabel>
                  <OutlinedInput
                    id="LastName"
                    type="text"
                    value={formik.values.LastName}
                    name="LastName"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter Last Name"
                  />
                  {formik.touched.LastName && formik.errors.LastName && <FormHelperText error>{formik.errors.LastName}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth error={Boolean(formik.touched.Email && formik.errors.Email)}>
                  <InputLabel htmlFor="Email">Email</InputLabel>
                  <OutlinedInput
                    id="Email"
                    type="email"
                    value={formik.values.Email}
                    name="Email"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter Email"
                  />
                  {formik.touched.Email && formik.errors.Email && <FormHelperText error>{formik.errors.Email}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth error={Boolean(formik.touched.PhoneNumber && formik.errors.PhoneNumber)}>
                  <InputLabel htmlFor="PhoneNumber">Phone Number</InputLabel>
                  <OutlinedInput
                    id="PhoneNumber"
                    type="text"
                    value={formik.values.PhoneNumber}
                    name="PhoneNumber"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter PhoneNumber"
                  />
                  {formik.touched.PhoneNumber && formik.errors.PhoneNumber && (
                    <FormHelperText error>{formik.errors.PhoneNumber}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="Whatsapp">Whatsapp</InputLabel>
                  <OutlinedInput
                    id="Whatsapp"
                    type="text"
                    value={formik.values.Whatsapp}
                    name="Whatsapp"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter Whatsapp"
                  />
                </FormControl>
              </Grid>

              {/* Row 3: Date of Birth */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="DateOfBirth">Date Of Birth</InputLabel>
                  <OutlinedInput
                    id="DateOfBirth"
                    type="date"
                    value={formik.values.DateOfBirth}
                    name="DateOfBirth"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter DateOfBirth"
                  />
                </FormControl>
              </Grid>

              {/* Row 4: ID Card Front and Back */}
              <Grid item xs={12} sm={6}>
                <div className="file-select-main">
                  <Dropzone onDrop={idCardFrontDrop}>
                    {({ getRootProps, getInputProps }) => (
                      <div {...getRootProps()} className="dropzone customer-id-image">
                        <input {...getInputProps()} />
                        {idFrontfile ? (
                          <img src={idFrontfile} alt="ID Card Front" className="file-selected" />
                        ) : (
                          <img
                            src={editCustomerList.cnicFront ? `${imageUrl}Customers/${editCustomerList.cnicFront}` : '/id-card-front.png'}
                            alt="ID Card Front"
                            className={editCustomerList.cnicFront ? 'file-selected' : 'no-file-selected'}
                          />
                        )}
                        <div className="dropzone-overly">
                          <p>Upload ID Card Front Side</p>
                        </div>
                      </div>
                    )}
                  </Dropzone>
                </div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <div className="file-select-main">
                  <Dropzone onDrop={idCardBackDrop}>
                    {({ getRootProps, getInputProps }) => (
                      <div {...getRootProps()} className="dropzone customer-id-image">
                        <input {...getInputProps()} />
                        {idBackfile ? (
                          <img src={idBackfile} alt="ID Card Back" className="file-selected" />
                        ) : (
                          <img
                            src={editCustomerList.cnicBack ? `${imageUrl}Customers/${editCustomerList.cnicBack}` : '/id-card-back.png'}
                            alt="ID Card Back"
                            className={editCustomerList.cnicBack ? 'file-selected' : 'no-file-selected'}
                          />
                        )}
                        <div className="dropzone-overly">
                          <p>Upload ID Card Back Side</p>
                        </div>
                      </div>
                    )}
                  </Dropzone>
                </div>
              </Grid>

              {/* Row 5: Business Details */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="BusinessName">Business Name</InputLabel>
                  <OutlinedInput
                    id="BusinessName"
                    type="text"
                    value={formik.values.BusinessName}
                    name="BusinessName"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter BusinessName"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <div className="file-select-main">
                  <Dropzone onDrop={businessCardDrop}>
                    {({ getRootProps, getInputProps }) => (
                      <div {...getRootProps()} className="dropzone customer-id-image">
                        <input {...getInputProps()} />
                        {businessCardFile ? (
                          <img src={businessCardFile} alt="Business Card" className="file-selected" />
                        ) : (
                          <img
                            src={
                              editCustomerList.businessCard ? `${imageUrl}Customers/${editCustomerList.businessCard}` : '/id-card-back.png'
                            }
                            alt="Business Card"
                            className={editCustomerList.businessCard ? 'file-selected' : 'no-file-selected'}
                          />
                        )}
                        <div className="dropzone-overly">
                          <p>Upload Business Card</p>
                        </div>
                      </div>
                    )}
                  </Dropzone>
                </div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="BusinessType">Business Type</InputLabel>
                  <OutlinedInput
                    id="BusinessType"
                    type="text"
                    value={formik.values.BusinessType}
                    name="BusinessType"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter BusinessType"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="Port">Port</InputLabel>
                  <OutlinedInput
                    id="Port"
                    type="text"
                    value={formik.values.Port}
                    name="Port"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter Port"
                  />
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
                      if (!/[0-9]/.test(event.key)) event.preventDefault();
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={Boolean(formik.touched.CountryId && formik.errors.CountryId)}>
                  <Autocomplete
                    id="countryId"
                    name="CountryId"
                    disablePortal
                    fullWidth
                    value={country}
                    onChange={handleCountryChange} // Updated handler
                    options={countryList}
                    getOptionLabel={(option) => option.name || ''}
                    renderInput={(params) => <TextField {...params} label="Select Country" />}
                    disabled={userData.userRole !== 'SuperAdmin'}
                  />
                  {formik.touched.CountryId && formik.errors.CountryId && <FormHelperText error>{formik.errors.CountryId}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={Boolean(formik.touched.currency && formik.errors.currency)}>
                  <InputLabel id="currency">Select Currency</InputLabel>
                  <Select
                    labelId="currency"
                    id="currency"
                    name="currency"
                    value={formik.values.currency}
                    label="Select Currency"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={userData.userRole !== 'SuperAdmin'} // Optional: Disable if not SuperAdmin
                  >
                    {currenciesList?.map((item, i) => (
                      <MenuItem value={item.title} key={i}>
                        {item.title}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.currency && formik.errors.currency && <FormHelperText error>{formik.errors.currency}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="City">City</InputLabel>
                  <OutlinedInput
                    id="City"
                    type="text"
                    value={formik.values.City}
                    name="City"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter City"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="Address">Address</InputLabel>
                  <OutlinedInput
                    id="Address"
                    type="text"
                    value={formik.values.Address}
                    name="Address"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter Address"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth error={Boolean(formik.touched.Password && formik.errors.Password)}>
                  <InputLabel htmlFor="Password">Password</InputLabel>
                  <OutlinedInput
                    id="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formik.values.Password}
                    name="Password"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter Password"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          size="large"
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  {formik.touched.Password && formik.errors.Password && <FormHelperText error>{formik.errors.Password}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Row 7: Submit Button */}
              <Grid item xs={12} sx={{ textAlign: 'right' }}>
                <Button disableElevation size="large" type="submit" variant="contained" color="secondary">
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </MainCard>
    </>
  );
}

export default CustomersAdd;

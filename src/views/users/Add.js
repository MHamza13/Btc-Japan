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
  InputAdornment
  // TextField,
  // Autocomplete,
} from '@mui/material';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCountryList } from 'store/country/countryActions';
import { addUser } from 'store/user/userActions';
import { useNavigate } from 'react-router';
import BackDropLoading from 'views/utilities/BackDropLoading';

const validation = yup.object({
  FirstName: yup.string('Enter FirstName').required('FirstName is required'),
  LastName: yup.string('Enter LastName').required('LastName is required'),
  Username: yup.string('Enter User Email Role').email('Enter a valid email').required('User Email is required'),
  CountryId: yup.string('Select User Country').required('Country is required'),
  Role: yup.string('Select User Role').required('User Role is required'),
  Password: yup
    .string('Enter User password')
    .required('Password is required')
    .matches('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})', 'Must Contain 6 Characters, One Uppercase, One Lowercase, and One Number'),
  ConfirmPassword: yup
    .string('Enter password')
    .required('Password is required')
    .oneOf([yup.ref('Password'), null], 'Passwords must match')
});

function UserAdd() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const countryList = useSelector((state) => state.countries.list);
  const loading = useSelector((state) => state.countries.loading);
  const [showPassword, setShowPassword] = useState(false);
  // const [country, setCountry] = useState(
  //     {
  //         id: 0,
  //         name: 'Select Country'
  //     }
  // );
  // console.log(country.id)
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    dispatch(fetchCountryList());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      FirstName: '',
      LastName: '',
      Username: '',
      CountryId: '',
      Password: '',
      ConfirmPassword: '',
      Role: ''
    },
    validationSchema: validation,
    onSubmit: (values) => {
      // setLoading(true)
      dispatch(addUser(values, navigate));
      // console.log(values)
    }
  });
  return (
    <>
      {loading ? <BackDropLoading /> : null}
      <MainCard title="Add New User">
        <Container>
          <Box component="form" noValidate onSubmit={formik.handleSubmit} autoComplete="off">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
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
                    inputProps={{}}
                  />
                  {formik.touched.FirstName && formik.errors.FirstName && (
                    <FormHelperText error id="standardFirstName">
                      {formik.errors.FirstName}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
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
                    inputProps={{}}
                  />
                  {formik.touched.LastName && formik.errors.LastName && (
                    <FormHelperText error id="standardLastName">
                      {formik.errors.LastName}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl required fullWidth error={Boolean(formik.touched.Username && formik.errors.Username)}>
                  <InputLabel htmlFor="Username">Username</InputLabel>
                  <OutlinedInput
                    id="Username"
                    type="email"
                    value={formik.values.Username}
                    name="Username"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter Username"
                    inputProps={{}}
                  />
                  {formik.touched.Username && formik.errors.Username && (
                    <FormHelperText error id="standardUsername">
                      {formik.errors.Username}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth error={Boolean(formik.touched.CountryId && formik.errors.CountryId)}>
                  <InputLabel id="CountryId">Select Country</InputLabel>
                  <Select
                    labelId="CountryId"
                    id="CountryId"
                    name="CountryId"
                    value={formik.values.CountryId}
                    label="Select Country"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="">
                      <em>Select Country</em>
                    </MenuItem>
                    {countryList === null
                      ? null
                      : countryList.map((item, i) => {
                          return (
                            <MenuItem value={item.id} key={i}>
                              {item.name}
                            </MenuItem>
                          );
                        })}
                  </Select>
                  {formik.touched.CountryId && formik.errors.CountryId && (
                    <FormHelperText error id="standardCountryId">
                      {formik.errors.CountryId}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth error={Boolean(formik.touched.Role && formik.errors.Role)}>
                  <InputLabel htmlFor="Role">Select Role</InputLabel>
                  <Select
                    labelId="Role"
                    id="Role"
                    name="Role"
                    value={formik.values.Role}
                    label="Select Role"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="">
                      <em>Select Role</em>
                    </MenuItem>
                    {/* <MenuItem value="SuperAdmin">Super Admin</MenuItem> */}
                    <MenuItem value="MainAdmin">Main Admin</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="AgentStock">Agent Stock</MenuItem>
                    <MenuItem value="AgentSales">Agent Sales</MenuItem>
                  </Select>
                  {formik.touched.Role && formik.errors.Role && (
                    <FormHelperText error id="standardRole">
                      {formik.errors.Role}
                    </FormHelperText>
                  )}
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
                  {formik.touched.Password && formik.errors.Password && (
                    <FormHelperText error id="standardPassword">
                      {formik.errors.Password}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth error={Boolean(formik.touched.ConfirmPassword && formik.errors.ConfirmPassword)}>
                  <InputLabel htmlFor="ConfirmPassword">Confirm Password</InputLabel>
                  <OutlinedInput
                    id="ConfirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formik.values.ConfirmPassword}
                    name="ConfirmPassword"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Enter Confirm Password"
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
                  {formik.touched.ConfirmPassword && formik.errors.ConfirmPassword && (
                    <FormHelperText error id="standardConfirmPassword">
                      {formik.errors.ConfirmPassword}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} style={{ textAlign: 'right' }}>
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

export default UserAdd;

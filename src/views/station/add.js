import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Box, Grid, FormControl, InputLabel, OutlinedInput, Button, TextField, Autocomplete } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { addStation, fetchEditStation, updateStation } from '../../store/station/StationAction';
import { fetchCountryList } from '../../store/country/countryActions';
import BackDropLoading from 'views/utilities/BackDropLoading';

const AddStation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams(); // Station ID from URL
  const countryList = useSelector((state) => state.countries.list || []);
  const editStationData = useSelector((state) => state.stations.editStation || {});
  const userData = useSelector((state) => state.user.user);
  const loading = useSelector((state) => state.stations.loading);

  const isEditMode = !!id; // True if editing, false if adding

  const [country, setCountry] = useState({
    id: userData?.userRole === 'SuperAdmin' ? 0 : userData?.countryId || 0,
    name: userData?.userRole === 'SuperAdmin' ? 'Select Country' : userData?.countryName || ''
  });

  const [formData, setFormData] = useState({
    id: id || '', // Use URL id directly as the source of truth
    city: '',
    stationName: '',
    currency: '',
    phoneNo: '',
    whatsApp: '',
    email: '',
    address: '',
    dp: null
  });

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchCountryList());
    if (isEditMode) {
      console.log('Fetching station with ID from URL:', id);
      dispatch(fetchEditStation(id));
    }
  }, [dispatch, id, isEditMode]);

  // Populate form with fetched station data
  useEffect(() => {
    if (isEditMode && Object.keys(editStationData).length > 0) {
      console.log('Fetched station data:', editStationData);
      if (editStationData.id && editStationData.id !== Number(id)) {
        console.error('ID mismatch! URL ID:', id, 'Fetched ID:', editStationData.id);
        // Optionally handle mismatch (e.g., redirect or show error)
        return;
      }

      const selectedCountry = countryList.find((c) => c.id === Number(editStationData.country)) || {
        id: 0,
        name: 'Select Country'
      };
      setCountry(selectedCountry);
      setFormData({
        id: id,
        city: editStationData.city || '',
        stationName: editStationData.stationName || '',
        currency: editStationData.currency || '',
        phoneNo: editStationData.phoneNo || '',
        whatsApp: editStationData.whatsApp || '',
        email: editStationData.email || '',
        address: editStationData.address || '',
        dp: null // File input remains null; existing image handled separately
      });
    }
  }, [editStationData, isEditMode, countryList, id]);

  // Update currency when country changes
  useEffect(() => {
    if (country.id && countryList.length > 0) {
      const selectedCountry = countryList.find((c) => c.id === country.id);
      if (selectedCountry) {
        const newCurrency = selectedCountry.currency || '';
        setFormData((prevData) => ({ ...prevData, currency: newCurrency }));
      }
    }
  }, [country.id, countryList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name !== 'currency') {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setFormData((prevData) => ({ ...prevData, dp: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const stationData = new FormData();
    stationData.append('country', String(country.id));
    stationData.append('city', String(formData.city));
    stationData.append('stationName', String(formData.stationName));
    stationData.append('currency', String(formData.currency));
    stationData.append('phoneNo', String(formData.phoneNo));
    stationData.append('whatsApp', String(formData.whatsApp));
    stationData.append('email', String(formData.email));
    stationData.append('address', String(formData.address));
    if (formData.dp) {
      stationData.append('imageFile', formData.dp);
    }

    for (let [key, value] of stationData.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    if (isEditMode) {
      console.log('Updating station with ID:', id); // Use URL id consistently
      dispatch(updateStation(id, stationData, navigate));
    } else {
      console.log('Adding new station');
      dispatch(addStation(stationData, navigate));
    }
  };

  const inputFields = [
    { name: 'stationName', label: 'Station Name', type: 'text' },
    { name: 'currency', label: 'Currency', type: 'text', disabled: true },
    { name: 'phoneNo', label: 'Phone No', type: 'tel' },
    { name: 'whatsApp', label: 'WhatsApp', type: 'tel' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'address', label: 'Address', type: 'text' }
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
            Edit Station
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
            Add Station
          </p>
        )
      }
    >
      <Container>
        {loading ? (
          <BackDropLoading />
        ) : (
          <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Autocomplete
                    id="country"
                    name="country"
                    disablePortal
                    fullWidth
                    value={country}
                    onChange={(event, newValue) => {
                      setCountry(newValue || { id: 0, name: '' });
                    }}
                    options={countryList}
                    getOptionLabel={(option) => option.name || ''}
                    renderInput={(params) => <TextField {...params} label="Select Country" />}
                    disabled={userData?.userRole !== 'SuperAdmin'}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>City</InputLabel>
                  <OutlinedInput name="city" value={formData.city} onChange={handleChange} label="City" type="text" />
                </FormControl>
              </Grid>

              {inputFields.map(({ name, label, type, disabled }, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <FormControl fullWidth>
                    <InputLabel>{label}</InputLabel>
                    <OutlinedInput
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      label={label}
                      type={type}
                      disabled={disabled || false}
                    />
                  </FormControl>
                </Grid>
              ))}

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
                    <span>Upload DP</span>
                    {formData.dp ? (
                      <span style={{ marginLeft: '10px' }}>{formData.dp.name}</span>
                    ) : isEditMode && editStationData.dpPath ? (
                      <span style={{ marginLeft: '10px' }}>Current: {editStationData.dpPath.split('/').pop()}</span>
                    ) : null}
                  </Box>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={12} sx={{ textAlign: 'right' }}>
                <Button size="large" type="submit" variant="contained" color="secondary">
                  {isEditMode ? 'Update' : 'Submit'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </MainCard>
  );
};

export default AddStation;

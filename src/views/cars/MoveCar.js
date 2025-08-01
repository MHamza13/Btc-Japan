import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Box, FormControl, FormHelperText, Grid, InputLabel, OutlinedInput } from '@mui/material';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { funcMoveCar, updateCarLocation, fetchEditCarList, updateCar } from 'store/car/carActions';
import { fetchStationList } from 'store/station/StationAction';
import { fetchCountryList, fetchCurrenciesList } from 'store/country/countryActions';
import { fetchVendorList } from 'store/vendor/vendorActions';
import BackDropLoading from 'views/utilities/BackDropLoading';
import moment from 'moment/moment';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  }
}));

const validation = yup.object({
  CurrencyRate: yup.number('Enter a valid Currency Rate').required('Currency Rate is required').positive('Currency Rate must be positive'),
  Expenses: yup.number('Enter a valid Expenses').required('Expenses is required').positive('Expenses must be positive')
});

function MoveCar(props) {
  const dispatch = useDispatch();
  const stationList = useSelector((state) => state.stations.list || []);
  const countriesList = useSelector((state) => state.countries.list || []);
  const currenciesList = useSelector((state) => state.countries.currenciesList || []);
  const editCarList = useSelector((state) => state.car.caEditList || {});
  const loading = useSelector((state) => state.car.loading);

  const [stationValue, setStationValue] = useState({ id: 0, stationName: 'Select Station', country: '' });

  const handleClose = () => {
    props.setMoveCar(false);
    setStationValue({ id: 0, stationName: 'Select Station', country: '' });
  };

  useEffect(() => {
    if (props.carID) {
      dispatch(fetchStationList());
      dispatch(fetchCountryList());
      dispatch(fetchVendorList());
      dispatch(fetchCurrenciesList());
      dispatch(fetchEditCarList(props.carID));
    }
  }, [dispatch, props.carID]);

  const formik = useFormik({
    enableReinitialize: true,
    validateOnMount: true,
    initialValues: {
      Id: props.carID || 0,
      StationId: stationValue.id || '',
      CurrencyRate: '',
      Expenses: '',
      Location: '',
      PurchaseVendorId: editCarList.purchaseVendorId || '', // Ensure this maintains the original value
      PurchaseCurrency: '',
      IsMoved: editCarList.IsMoved || false
    },
    validationSchema: validation,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const selectedStation = stationList.find((station) => station.id === values.StationId);
        if (!selectedStation) throw new Error('Please select a station');

        const stationCountryId = Number(selectedStation.country);
        const matchedCountry = countriesList.find((country) => country.id === stationCountryId);
        const countryName = matchedCountry?.name || '';

        const purchaseCurrency = matchedCountry?.currency
          ? currenciesList.find((c) => c.title === matchedCountry.currency)?.title || ''
          : '';

        const currentPurchasePrice = parseFloat(editCarList.purchasePrice) || 0;
        const currencyRate = parseFloat(values.CurrencyRate) || 0;
        const expenses = parseFloat(values.Expenses) || 0;
        const updatedPurchasePrice = (currentPurchasePrice * currencyRate + expenses).toString();

        const moveCarFormData = new FormData();
        moveCarFormData.append('Id', values.Id);
        moveCarFormData.append('StationId', values.StationId);
        moveCarFormData.append('CurrencyRate', values.CurrencyRate.toString());
        moveCarFormData.append('Expenses', values.Expenses.toString());
        moveCarFormData.append('PurchaseVendorId', editCarList.purchaseVendorId || values.PurchaseVendorId); // Use original vendor ID
        moveCarFormData.append('PurchaseCurrency', purchaseCurrency);
        moveCarFormData.append('PurchasePrice', updatedPurchasePrice);
        moveCarFormData.append('IsMoved', 'true');

        const carUpdateFormData = new FormData();
        carUpdateFormData.append('Id', values.Id);
        carUpdateFormData.append('Model', editCarList.model || '');
        carUpdateFormData.append('CountryId', stationCountryId.toString());
        carUpdateFormData.append('ChassisNo', editCarList.chassisNo || '');
        carUpdateFormData.append('PurchasePrice', updatedPurchasePrice);
        carUpdateFormData.append('PurchaseVendorId', editCarList.purchaseVendorId || values.PurchaseVendorId); // Maintain original vendor ID
        carUpdateFormData.append('PurchaseCurrency', purchaseCurrency);
        carUpdateFormData.append('PurchaseDate', editCarList.purchaseDate || moment().format('YYYY-MM-DD'));
        carUpdateFormData.append('PurchaseDetails', editCarList.purchaseDetails || '');
        carUpdateFormData.append('IsAvailable', editCarList.isAvailable?.toString() || 'true');
        carUpdateFormData.append('Location', countryName);
        carUpdateFormData.append('BodyType', editCarList.bodyType || '');
        carUpdateFormData.append('YearOfManufacture', editCarList.manufactureYear || '');
        carUpdateFormData.append('EngineCC', editCarList.engineCC || '');
        carUpdateFormData.append('Mileage', editCarList.mileage || '');
        carUpdateFormData.append('SeatingCapicaty', editCarList.seatingCapicaty || '');
        carUpdateFormData.append('Doors', editCarList.doors || '');
        carUpdateFormData.append('Cylinders', editCarList.cylinders || '');
        carUpdateFormData.append('Horespower', editCarList.horespower || '');
        carUpdateFormData.append('SteeringSide', editCarList.steeringSide || '');
        carUpdateFormData.append('DriveSystem', editCarList.driveSystem || '');
        carUpdateFormData.append('Transmission', editCarList.transmission || '');
        carUpdateFormData.append('Condition', editCarList.condition || '');
        carUpdateFormData.append('FuelType', editCarList.fuelType || '');
        carUpdateFormData.append('Color', editCarList.color || '');
        carUpdateFormData.append('StationId', values.StationId);
        carUpdateFormData.append('Category', editCarList.category || '');
        carUpdateFormData.append('IsMoved', 'true');

        const existingImages =
          editCarList?.galleryImages && editCarList.galleryImages !== ''
            ? typeof editCarList.galleryImages === 'string' && editCarList.galleryImages.startsWith('[')
              ? JSON.parse(editCarList.galleryImages)
              : editCarList.galleryImages.split(',').map((url) => url.trim())
            : [];
        carUpdateFormData.append('ExistingGalleryImages', JSON.stringify(existingImages));

        const locationFormData = new FormData();
        locationFormData.append('Id', values.Id);
        locationFormData.append('Location', countryName);

        // Sequential dispatch calls
        await dispatch(funcMoveCar(moveCarFormData, () => {}));
        await dispatch(updateCar(values.Id, carUpdateFormData, handleClose));
        await dispatch(updateCarLocation(locationFormData, handleClose, values.Id));

        setSubmitting(false);
      } catch (error) {
        console.error('Error moving car:', error);
        setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    const selectedStation = stationList.find((station) => station.id === formik.values.StationId);
    if (selectedStation) {
      const stationCountryId = Number(selectedStation.country);
      const matchedCountry = countriesList.find((country) => country.id === stationCountryId);
      const purchaseCurrency = matchedCountry?.currency ? currenciesList.find((c) => c.title === matchedCountry.currency)?.title || '' : '';
      formik.setFieldValue('PurchaseCurrency', purchaseCurrency);
    }
  }, [formik.values.StationId, stationList, countriesList, currenciesList]);

  return (
    <>
      {loading ? <BackDropLoading /> : null}
      <BootstrapDialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={props.moveCar}>
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{ fontSize: '20px' }}>
          Move Vehicles to Station
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
        <Box component="form" noValidate onSubmit={formik.handleSubmit} autoComplete="off">
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <FormControl fullWidth>
                  <Autocomplete
                    disablePortal
                    fullWidth
                    value={stationValue}
                    onChange={(event, newValue) => {
                      const selectedStation = newValue || { id: 0, stationName: 'Select Station', country: '' };
                      setStationValue(selectedStation);
                      formik.setFieldValue('StationId', selectedStation.id || '');
                    }}
                    id="station-select"
                    options={stationList}
                    getOptionLabel={(option) => option.stationName || ''}
                    renderInput={(params) => <TextField {...params} label="Select Station" />}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12}>
                <FormControl required fullWidth error={Boolean(formik.touched.CurrencyRate && formik.errors.CurrencyRate)}>
                  <InputLabel htmlFor="CurrencyRate">Currency Rate</InputLabel>
                  <OutlinedInput
                    id="CurrencyRate"
                    type="number"
                    value={formik.values.CurrencyRate}
                    name="CurrencyRate"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Currency Rate"
                    inputProps={{ step: '0.01' }}
                  />
                  {formik.touched.CurrencyRate && formik.errors.CurrencyRate && (
                    <FormHelperText error id="standardCurrencyRate">
                      {formik.errors.CurrencyRate}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12}>
                <FormControl required fullWidth error={Boolean(formik.touched.Expenses && formik.errors.Expenses)}>
                  <InputLabel htmlFor="Expenses">Expenses</InputLabel>
                  <OutlinedInput
                    id="Expenses"
                    type="number"
                    value={formik.values.Expenses}
                    name="Expenses"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Expenses"
                    inputProps={{ step: '0.01' }}
                  />
                  {formik.touched.Expenses && formik.errors.Expenses && (
                    <FormHelperText error id="standardExpenses">
                      {formik.errors.Expenses}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button autoFocus type="submit" variant="contained" color="secondary" disabled={formik.isSubmitting}>
              Move Vehicle
            </Button>
          </DialogActions>
        </Box>
      </BootstrapDialog>
    </>
  );
}

export default MoveCar;

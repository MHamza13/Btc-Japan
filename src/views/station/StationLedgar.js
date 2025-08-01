import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';
import { IconPlus } from '@tabler/icons';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { fetchStationList } from 'store/station/StationAction';
import { fetchCurrenciesList, fetchCountryList } from 'store/country/countryActions';
import { fetchCarList } from 'store/car/carActions';
import BackDropLoading from 'views/utilities/BackDropLoading';
import { FormControl, FormHelperText, Grid, InputLabel, OutlinedInput, Select, MenuItem } from '@mui/material';

// Placeholder for a new Redux action to add station payment terms
import { addStationTermPayment } from 'store/station/StationAction'; // You'll need to create this

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  }
}));

const validation = yup.object({
  currency: yup.string('Enter Currency').required('Currency is required'),
  cashIn: yup.number('Enter a valid amount').when('cashOut', {
    is: (cashOut) => !cashOut || cashOut === '',
    then: yup.number().required('Cash In or Cash Out is required').positive('Amount must be positive'),
    otherwise: yup.number().notRequired()
  }),
  cashOut: yup.number('Enter a valid amount').when('cashIn', {
    is: (cashIn) => !cashIn || cashIn === '',
    then: yup.number().required('Cash In or Cash Out is required').positive('Amount must be positive'),
    otherwise: yup.number().notRequired()
  })
});

const AddStationTermPayment = ({ open, setOpen, stationId, stationCurrency }) => {
  const dispatch = useDispatch();
  const currenciesList = useSelector((state) => state.countries.currenciesList || []);

  const handleClose = () => {
    setOpen(false);
  };

  const formik = useFormik({
    enableReinitialize: true,
    validateOnMount: true,
    initialValues: {
      Id: 0,
      stationId: stationId || 0,
      cashIn: '',
      cashOut: '',
      currency: stationCurrency || '',
      details: '',
      chequeNo: '',
      location: ''
    },
    validationSchema: validation,
    onSubmit: (values) => {
      const formData = new FormData();
      for (const key in values) {
        formData.append(key, values[key]);
      }
      dispatch(addStationTermPayment(formData, handleClose));
    }
  });

  return (
    <BootstrapDialog onClose={handleClose} aria-labelledby="station-term-payment-title" open={open}>
      <DialogTitle sx={{ m: 0, p: 2 }} id="station-term-payment-title" style={{ fontSize: '20px' }}>
        Add Station Payment Term
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
              <FormControl fullWidth error={Boolean(formik.touched.cashIn && formik.errors.cashIn)}>
                <InputLabel htmlFor="cashIn">Cash In</InputLabel>
                <OutlinedInput
                  id="cashIn"
                  type="number"
                  value={formik.values.cashIn}
                  name="cashIn"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  label="Cash In"
                  inputProps={{ step: '0.01' }}
                />
                {formik.touched.cashIn && formik.errors.cashIn && <FormHelperText error>{formik.errors.cashIn}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12}>
              <FormControl fullWidth error={Boolean(formik.touched.cashOut && formik.errors.cashOut)}>
                <InputLabel htmlFor="cashOut">Cash Out</InputLabel>
                <OutlinedInput
                  id="cashOut"
                  type="number"
                  value={formik.values.cashOut}
                  name="cashOut"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  label="Cash Out"
                  inputProps={{ step: '0.01' }}
                />
                {formik.touched.cashOut && formik.errors.cashOut && <FormHelperText error>{formik.errors.cashOut}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12}>
              <FormControl required fullWidth error={Boolean(formik.touched.currency && formik.errors.currency)}>
                <InputLabel id="currency">Currency</InputLabel>
                <Select
                  labelId="currency"
                  id="currency"
                  name="currency"
                  value={formik.values.currency}
                  label="Currency"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
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
                {formik.touched.currency && formik.errors.currency && <FormHelperText error>{formik.errors.currency}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12}>
              <FormControl fullWidth>
                <InputLabel htmlFor="chequeNo">Cheque No</InputLabel>
                <OutlinedInput
                  id="chequeNo"
                  type="text"
                  value={formik.values.chequeNo}
                  name="chequeNo"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  label="Cheque No"
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12}>
              <FormControl fullWidth>
                <InputLabel htmlFor="location">Location</InputLabel>
                <OutlinedInput
                  id="location"
                  type="text"
                  value={formik.values.location}
                  name="location"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  label="Location"
                  multiline
                  rows={3}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12}>
              <FormControl fullWidth>
                <InputLabel htmlFor="details">Details</InputLabel>
                <OutlinedInput
                  id="details"
                  type="text"
                  value={formik.values.details}
                  name="details"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  label="Details"
                  multiline
                  rows={5}
                />
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button autoFocus type="submit" variant="contained" color="secondary">
            Add Payment
          </Button>
        </DialogActions>
      </Box>
    </BootstrapDialog>
  );
};

const StationLedgar = () => {
  const dispatch = useDispatch();
  const [addTermPaymentOpen, setAddTermPaymentOpen] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const stationsList = useSelector((state) => state.stations.list || []);
  const countriesList = useSelector((state) => state.countries.list || []);
  const carDataMain = useSelector((state) => state.car.calist || []);
  const currenciesList = useSelector((state) => state.countries.currenciesList || []);
  const loading = useSelector((state) => state.stations.loading || state.countries.loading || state.car.loading);

  // Placeholder for station payments (you'll need to fetch this from the backend)
  const [stationPayments, setStationPayments] = useState([]); // Replace with Redux state if available

  useEffect(() => {
    dispatch(fetchStationList());
    dispatch(fetchCountryList());
    dispatch(fetchCarList());
    dispatch(fetchCurrenciesList());
    // TODO: Fetch station payments from backend (e.g., dispatch(fetchStationPayments()))
    // For now, we'll simulate it with an empty array
  }, [dispatch]);

  const handleAddPayment = (stationId) => {
    setSelectedStationId(stationId);
    setAddTermPaymentOpen(true);
  };

  // Enrich stations with car count, total price, and currency
  const enrichedStations = stationsList.map((station) => {
    const country = countriesList.find((c) => c.id === Number(station.country));
    const carsAtStation = carDataMain.filter((car) => Number(car.stationId) === station.id);
    const totalPurchasePrice = carsAtStation.reduce((sum, car) => sum + (parseFloat(car.purchasePrice) || 0), 0);
    const stationCurrency = country ? currenciesList.find((curr) => curr.title === country.currency)?.title || 'Unknown' : 'Unknown';
    return {
      ...station,
      carCount: carsAtStation.length,
      totalPurchasePrice,
      currency: stationCurrency,
      countryName: country ? country.name : 'Unknown'
    };
  });

  // Filter payments for the selected station (placeholder logic)
  const paymentsForStation = stationPayments.filter((payment) => payment.stationId === selectedStationId);

  // Calculate totals
  const totalCashIn = paymentsForStation.reduce((sum, payment) => sum + (parseFloat(payment.cashIn) || 0), 0);
  const totalCashOut = paymentsForStation.reduce((sum, payment) => sum + (parseFloat(payment.cashOut) || 0), 0);

  return (
    <>
      {loading ? <BackDropLoading /> : null}
      <Box sx={{ p: 3 }}>
        <Typography variant="h2" gutterBottom>
          Station Ledger
        </Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="station ledger table">
            <TableHead>
              <TableRow>
                <TableCell>Station Name</TableCell>
                <TableCell>Country</TableCell>
                <TableCell align="right">Number of Cars</TableCell>
                <TableCell align="right">Total Purchase Price</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enrichedStations.map((station) => (
                <TableRow key={station.id}>
                  <TableCell>{station.stationName}</TableCell>
                  <TableCell>{station.countryName}</TableCell>
                  <TableCell align="right">{station.carCount}</TableCell>
                  <TableCell align="right">{`${station.totalPurchasePrice.toFixed(2)} ${station.currency}`}</TableCell>
                  <TableCell align="right">
                    <Button variant="contained" color="secondary" startIcon={<IconPlus />} onClick={() => handleAddPayment(station.id)}>
                      Add Payment
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {selectedStationId && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
              Payments for {enrichedStations.find((s) => s.id === selectedStationId)?.stationName}
            </Typography>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="station payments table">
                <TableHead>
                  <TableRow>
                    <TableCell>Cash In</TableCell>
                    <TableCell>Cash Out</TableCell>
                    <TableCell>Currency</TableCell>
                    <TableCell>Cheque No</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentsForStation.length > 0 ? (
                    paymentsForStation.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>{payment.cashIn || '-'}</TableCell>
                        <TableCell>{payment.cashOut || '-'}</TableCell>
                        <TableCell>{payment.currency}</TableCell>
                        <TableCell>{payment.chequeNo || '-'}</TableCell>
                        <TableCell>{payment.location || '-'}</TableCell>
                        <TableCell>{payment.details || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No payments recorded
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell>
                      <strong>Total: {totalCashIn.toFixed(2)}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Total: {totalCashOut.toFixed(2)}</strong>
                    </TableCell>
                    <TableCell colSpan={4} />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        <AddStationTermPayment
          open={addTermPaymentOpen}
          setOpen={setAddTermPaymentOpen}
          stationId={selectedStationId}
          stationCurrency={enrichedStations.find((s) => s.id === selectedStationId)?.currency}
        />
      </Box>
    </>
  );
};

export default StationLedgar;

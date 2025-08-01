import React, { useEffect } from 'react';
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
import { useFormik } from 'formik';
import * as yup from 'yup';
import { fetchEditCarList, updateCarLocation } from 'store/car/carActions';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  }
}));

const validation = yup.object({
  Location: yup.string('Enter Location').required('Location is required')
});

function CarLocation(props) {
  const dispatch = useDispatch();
  const editCarList = useSelector((state) => state.car.caEditList || {}); // Fallback to empty object

  const handleClose = () => {
    props.setCarLocationPopup(false);
  };

  // Fetch car data when carID changes or dialog opens
  useEffect(() => {
    if (props.carID && props.carLocationPopup) {
      dispatch(fetchEditCarList(props.carID));
    }
  }, [dispatch, props.carID, props.carLocationPopup]);

  const formik = useFormik({
    enableReinitialize: true, // Reinitialize form when editCarList updates
    validateOnMount: true,
    initialValues: {
      Id: props.carID || 0,
      Location: editCarList.location || '' // Use latest location from Redux store
    },
    validationSchema: validation,
    onSubmit: (values) => {
      const formData = new FormData();
      for (const key in values) {
        formData.append(key, values[key]);
      }
      dispatch(updateCarLocation(formData, handleClose, props.carID));
    }
  });

  return (
    <>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={props.carLocationPopup}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{ fontSize: '20px' }}>
          Update Car Location
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box component="form" noValidate onSubmit={formik.handleSubmit} autoComplete="off">
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <FormControl
                  required
                  fullWidth
                  error={Boolean(formik.touched.Location && formik.errors.Location)}
                  style={{ width: '500px' }}
                >
                  <InputLabel htmlFor="Location">Location</InputLabel>
                  <OutlinedInput
                    id="Location"
                    type="text"
                    value={formik.values.Location}
                    name="Location"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    label="Location"
                    inputProps={{}}
                    multiline
                    rows={5}
                  />
                  {formik.touched.Location && formik.errors.Location && (
                    <FormHelperText error id="standardLocation">
                      {formik.errors.Location}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button autoFocus type="submit" variant="contained" color="secondary">
              Update Location
            </Button>
          </DialogActions>
        </Box>
      </BootstrapDialog>
    </>
  );
}

export default CarLocation;
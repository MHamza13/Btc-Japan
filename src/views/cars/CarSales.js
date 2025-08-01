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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {
    Box,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    OutlinedInput,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import moment from 'moment/moment';
import { addSaleCar } from 'store/car/carActions';
import { fetchCustomerList } from 'store/customer/customerActions';
// import { currencies } from 'views/utilities/currencies';
import { fetchCurrenciesList } from 'store/country/countryActions';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';





const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const validation = yup.object({
    SaleCustomerId: yup
        .string('Select Customer')
        .required('Customer is required'),
    SalePrice: yup
        .string('Enter Sale Price')
        .required('Sale Price is required'),
    SaleCurrency: yup
        .string('Enter Currency')
        .required('Currency is required'),
});

function CarSales(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const customerList = useSelector((state) => state.customer.clist);
    const currenciesList = useSelector((state) => state.countries.currenciesList);
    // const loading = useSelector((state) => state.vendor.loading);
    const todayDate = moment().format("YYYY-MM-DD");
    const [customerId, setCustomerId] = useState()

    const handleClose = () => {
        props.setSaleseOpen(false);
    };


    useEffect(()=>{
        dispatch(fetchCurrenciesList())
        dispatch(fetchCustomerList());
    }, [dispatch]);

    
    const handelCustomerId = (e) =>{
        setCustomerId(e.target.value)
    }

    const customerCurrency = customerList.filter(function(item){
        return item.id === customerId ? item.currency : null;
    });


    const formik = useFormik({
        enableReinitialize:true,
        validateOnMount: true,
        initialValues: {
            Id: props.carID,
            SaleCustomerId: `${customerId}`,
            SalePrice: '',
            SaleCurrency: `${customerCurrency[0] === undefined ? null : customerCurrency[0].currency}`,
            SaleDate: `${todayDate}`,
            SaleDetails: '',
            SaleDoc: '',
            SaleImage: '',
            IsAvailable: false
        },
        validationSchema: validation,
        onSubmit: (values) => {
            // setLoading(true)
            const formData = new FormData();
            for (const key in values) {
                formData.append(key, values[key]);
            }
            dispatch(addSaleCar(formData, handleClose)).then(()=>{
                navigate('/vehicles/soldout')
            })
            console.log(formData)
        },
    });

    return(<>
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={props.salesOpen}
        >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{fontSize: '20px'}}>
                Sale Car {props.carName}
            </DialogTitle>
            <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
            }}
            >
                <CloseIcon />
            </IconButton>
            <Box component="form" noValidate onSubmit={formik.handleSubmit} autoComplete="off">
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl required fullWidth error={Boolean(formik.touched.SaleCustomerId && formik.errors.SaleCustomerId)}>
                                <InputLabel id="SaleCustomerId">Select Customer</InputLabel>
                                <Select
                                    labelId="SaleCustomerId"
                                    id="SaleCustomerId"
                                    name="SaleCustomerId"
                                    value={customerId}
                                    label="Select Customer"
                                    onChange={handelCustomerId}
                                    onBlur={formik.handleBlur}
                                >
                                    <MenuItem value="">
                                        <em>Select Customer</em>
                                    </MenuItem>
                                    {customerList === null ? null : customerList.map((item, i)=>{
                                        return <MenuItem value={item.id} key={i}>{item.firstName} {item.lastName}</MenuItem>;
                                    })}
                                </Select>
                                {formik.touched.SaleCustomerId && formik.errors.SaleCustomerId && (
                                    <FormHelperText error id="standardSaleCustomerId">
                                    {formik.errors.SaleCustomerId}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl required fullWidth error={Boolean(formik.touched.SalePrice && formik.errors.SalePrice)}>
                                <InputLabel htmlFor="SalePrice">Sale Price</InputLabel>
                                <OutlinedInput
                                    id="SalePrice"
                                    type="text"
                                    value={formik.values.SalePrice}
                                    name="SalePrice"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Enter Sale Price"
                                    inputProps={{}}
                                />
                                {formik.touched.SalePrice && formik.errors.SalePrice && (
                                    <FormHelperText error id="standard cost">
                                    {formik.errors.SalePrice}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl required fullWidth error={Boolean(formik.touched.SaleCurrency && formik.errors.SaleCurrency)} disabled>
                                <InputLabel id="SaleCurrency">Sale Currency</InputLabel>
                                <Select
                                    labelId="SaleCurrency"
                                    id="SaleCurrency"
                                    name="SaleCurrency"
                                    value={formik.values.SaleCurrency}
                                    label="Sale Currency"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    <MenuItem value="">
                                        <em>Sale Currency</em>
                                    </MenuItem>
                                    {currenciesList.map((item, i)=>{
                                        return <MenuItem value={item.title} key={i}>{item.title}</MenuItem>;
                                    })}
                                </Select>
                                {formik.touched.SaleCurrency && formik.errors.SaleCurrency && (
                                    <FormHelperText error id="standardSaleCurrency">
                                    {formik.errors.SaleCurrency}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="SaleDate">Sale Date</InputLabel>
                                <OutlinedInput
                                    id="SaleDate"
                                    type="date"
                                    value={formik.values.SaleDate}
                                    name="SaleDate"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Enter Sale Date"
                                    inputProps={{}}
                                    disabled
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <FormControl focused fullWidth>
                                <InputLabel htmlFor="SaleDoc">Sale Doc</InputLabel>
                                <OutlinedInput
                                    id="SaleDoc"
                                    type="file"
                                    name="SaleDoc"
                                    onChange={(event) => {
                                        const file = event.currentTarget.files[0];
                                        if (file && file.type === "application/pdf") {
                                            formik.setFieldValue("SaleDoc", file);
                                        } else {
                                            Swal.fire({
                                                title: "Error!",
                                                text: 'Please upload a valid PDF file. Only files in PDF format are accepted.',
                                                icon: "error"
                                            });
                                        }
                                    }}
                                    label="Enter Sale Doc"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <FormControl focused fullWidth>
                                <InputLabel htmlFor="SaleImage">Sale Image</InputLabel>
                                <OutlinedInput
                                    id="SaleImage"
                                    type="file"
                                    name="SaleImage"
                                    accept="image/png, image/jpeg"
                                    onChange={(event) => {
                                        const file = event.currentTarget.files[0];
                                        if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
                                            formik.setFieldValue("SaleImage", file);
                                        } else {
                                            Swal.fire({
                                                title: "Error!",
                                                text: 'Please select a PNG or JPEG image.',
                                                icon: "error"
                                            });
                                        }
                                    }}
                                    label="Enter Sale Image"
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
                                    label="Enter details"
                                    inputProps={{}}
                                    multiline
                                    rows={5}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus type='submit' variant="contained" color="secondary">
                        Sale Car
                    </Button>
                </DialogActions>
            </Box>
        </BootstrapDialog>
    </>);
}




export default CarSales;
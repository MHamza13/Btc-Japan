import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {
    Box,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { addTermPayment } from 'store/car/carActions';
// import { currencies } from 'views/utilities/currencies';
import { fetchCurrenciesList } from 'store/country/countryActions';





const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const validation = yup.object({
    currency: yup
        .string('Enter Currency')
        .required('Currency is required'),
});

function AddTermPayment(props) {
    const dispatch = useDispatch();
    const currenciesList = useSelector((state) => state.countries.currenciesList);
    // const loading = useSelector((state) => state.vendor.loading);
    const handleClose = () => {
        props.setAddTermPayment(false);
    };


    useEffect(()=> {
        dispatch(fetchCurrenciesList())
    }, [dispatch])


    const formik = useFormik({
        enableReinitialize:true,
        validateOnMount: true,
        initialValues: {
            Id: 0,
            carId: props.carID,
            cashIn: '',
            cashOut: '',
            currency: `${props.saleCurrency}`,
            details: '',
            chequeNo: '',
            Location: ''
        },
        validationSchema: validation,
        onSubmit: (values) => {
            // setLoading(true)
            const formData = new FormData();
            for (const key in values) {
                formData.append(key, values[key]);
            }
            dispatch(addTermPayment(formData, handleClose, props.carID))
            // console.log(formData)
        },
    });

    return(<>
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={props.addTermPayment}
        >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{fontSize: '20px'}}>
                Add Payment Term ({props.pendingPayment !== 0 ? `Pending Amount: ${props.pendingPayment} ${props.saleCurrency}` : null})
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
                        {props.carStatus === false ? 
                        <Grid item xs={12} sm={12}>
                            <FormControl required fullWidth>
                                <InputLabel htmlFor="cashIn">Cash In</InputLabel>
                                <OutlinedInput
                                    id="cashIn"
                                    type="text"
                                    value={formik.values.cashIn}
                                    name="cashIn"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Cash In"
                                    inputProps={{}}
                                />
                            </FormControl>
                        </Grid> : 
                        <Grid item xs={12} sm={12}>
                            <FormControl required fullWidth>
                                <InputLabel htmlFor="cashOut">Cash Out</InputLabel>
                                <OutlinedInput
                                    id="cashOut"
                                    type="text"
                                    value={formik.values.cashOut}
                                    name="cashOut"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Cash Out"
                                    inputProps={{}}
                                />
                            </FormControl>
                        </Grid>
                        }
                        <Grid item xs={12} sm={12}>
                            <FormControl required fullWidth error={Boolean(formik.touched.currency && formik.errors.currency)} disabled>
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
                                        <em>Currency</em>
                                    </MenuItem>
                                    {currenciesList.map((item, i)=>{
                                        return <MenuItem value={item.title} key={i}>{item.title}</MenuItem>;
                                    })}
                                </Select>
                                {formik.touched.currency && formik.errors.currency && (
                                    <FormHelperText error id="standardCurrency">
                                    {formik.errors.currency}
                                    </FormHelperText>
                                )}
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
                                    inputProps={{}}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <FormControl fullWidth>
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
                        Add Payment
                    </Button>
                </DialogActions>
            </Box>
        </BootstrapDialog>
    </>);
}





export default AddTermPayment;
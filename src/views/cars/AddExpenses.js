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
import { addExpense, fetchEditExpenseList, updateExpense } from 'store/car/carActions';
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
    cost: yup
        .string('Enter Cost')
        .required('Cost is required'),
    currency: yup
        .string('Enter Currency')
        .required('Currency is required'),
});

function AddExpenses(props) {
    const dispatch = useDispatch();
    const editExpList = useSelector((state) => state.car.exEditList);
    const currenciesList = useSelector((state) => state.countries.currenciesList);
    // const loading = useSelector((state) => state.countries.loading);
    const handleClose = () => {
        props.setExpenseOpen(false);
    };

    useEffect(()=>{
        dispatch(fetchCurrenciesList())
        if(props.id){
            dispatch(fetchEditExpenseList(props.id))
        }
    }, [dispatch, props.id])


    const formik = useFormik({
        enableReinitialize:true,
        validateOnMount: true,
        initialValues: {
            Id: props.id ? `${props.id}` : 0,
            carId: props.carID,
            cost: props.id ? `${editExpList.cost}` : '',
            currency: props.id ? `${editExpList.currency}` : `${props.saleCurrency}`,
            details: props.id ? `${editExpList.details}` : '',
            doc: props.id ? `${editExpList.doc}` : '',
        },
        validationSchema: validation,
        onSubmit: (values) => {
            // setLoading(true)
            const formData = new FormData();
            for (const key in values) {
                formData.append(key, values[key]);
            }
            if(props.id){
                dispatch(updateExpense(props.id, formData, handleClose, props.carID))
            } else{
                dispatch(addExpense(formData, handleClose, props.carID))
            }
            // console.log(formData)
        },
    });

    return(<>
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={props.expenseOpen}
        >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{fontSize: '20px'}}>
                Add Expense
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
                        <Grid item xs={12} sm={12}>
                            <FormControl required fullWidth error={Boolean(formik.touched.cost && formik.errors.cost)}>
                                <InputLabel htmlFor="cost">Cost</InputLabel>
                                <OutlinedInput
                                    id="cost"
                                    type="text"
                                    value={formik.values.cost}
                                    name="cost"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Enter Cost"
                                    inputProps={{}}
                                />
                                {formik.touched.cost && formik.errors.cost && (
                                    <FormHelperText error id="standardcost">
                                    {formik.errors.cost}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
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
                            <FormControl focused fullWidth>
                                <InputLabel htmlFor="doc">Doc</InputLabel>
                                <OutlinedInput
                                    id="doc"
                                    type="file"
                                    name="doc"
                                    accept="image/png, image/jpeg,.pdf"
                                    onChange={(event) => {
                                        formik.setFieldValue("doc", event.currentTarget.files[0]);
                                    }}
                                    label="Enter doc"
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
                        Save changes
                    </Button>
                </DialogActions>
            </Box>
        </BootstrapDialog>
    </>);
}





export default AddExpenses;
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
    OutlinedInput,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { addExpense, fetchCarList } from 'store/car/carActions';
import BackDropLoading from 'views/utilities/BackDropLoading';
// import { currencies } from 'views/utilities/currencies';





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

function DashboardAddExpense(props) {
    const dispatch = useDispatch();
    const carList = useSelector((state) => state.car.calist);
    const loading = useSelector((state) => state.car.loading);
    const [carValue, setCarValue] = React.useState(
        {
            id: 0,
            chassisNo: 'Select Car'
        }
    );
    const handleClose = () => {
        props.setDashboardExpensePopupOpen(false);
    };

    useEffect(()=>{
        dispatch(fetchCarList())
    }, [dispatch])
    
    const carData = carList.filter(function(item){
        return item.isAvailable === true;
    });

    const formik = useFormik({
        enableReinitialize:true,
        validateOnMount: true,
        initialValues: {
            Id: 0,
            carId: `${carValue === null ? '' : carValue.id}`,
            cost: '',
            currency: `${carValue === null ? '' : carValue.purchaseCurrency}`,
            details: '',
            doc: '',
        },
        validationSchema: validation,
        onSubmit: (values) => {
            // setLoading(true)
            const formData = new FormData();
            for (const key in values) {
                formData.append(key, values[key]);
            }
            dispatch(addExpense(formData, handleClose, carValue === null ? '' : carValue.id))
            // console.log(formData)
        },
    });
    
    console.log(carValue)
    return(<>
        {loading ? <BackDropLoading /> : null}
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={props.dashboardExpensePopupOpen}
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
                            <FormControl fullWidth>
                                <Autocomplete
                                    disablePortal
                                    fullWidth
                                    value={carValue}
                                    onChange={(event, newValue) => {
                                        setCarValue(newValue);
                                    }}
                                    id="combo-box-demo"
                                    options={carData}
                                    getOptionLabel={((option) => option.chassisNo )}
                                    renderInput={(params) => <TextField {...params} label="Select Car" />}
                                />
                            </FormControl>
                        </Grid>
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





export default DashboardAddExpense;
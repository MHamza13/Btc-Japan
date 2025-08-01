import React, { useEffect, useState } from 'react';
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
    Stack,
    TextField
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
// import TableCell from '@mui/material/TableCell';
// import TableRow from '@mui/material/TableRow';
// import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import moment from 'moment/moment';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrenciesList } from 'store/country/countryActions';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';




const validation = yup.object({
    name: yup
        .string('Enter Name')
        .required('Name is required')
});


// const columns = ['Name', 'Phone', 'Amount', 'Address', 'Details'];

function BillBook(){
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const todayDate = moment().format("YYYY-MM-DD");
    const currenciesList = useSelector((state) => state.countries.currenciesList);

    // const handleClickOpen = () => {
    //     setOpen(true);
    // };

    useEffect(()=>{
        dispatch(fetchCurrenciesList())
    }, [dispatch])

    const handleClose = () => {
        setOpen(false);
    };

    const [repeaterFields, setRepeaterFields] = useState([
        { 
            name: '',
            quantity: 1,
            unitPrice: ``,
            description: '',
            totalPrice: ''
        }
    ])
    const repeaterHandleFieldChange = (index, field, value) => {
        const updatedFields = [...repeaterFields];
        updatedFields[index][field] = value;
        setRepeaterFields(updatedFields);
    };
    const repeateraddFields = () => {
        let newfield = { 
            name: '',
            quantity: 1,
            unitPrice: ``,
            description: '',
            totalPrice: ''
        }
    
        setRepeaterFields([...repeaterFields, newfield])
    }
    const  repeaterRemoveFields = (index) => {
        let data = [...repeaterFields];
        data.splice(index, +1)
        setRepeaterFields(data)
    }

    // console.log(repeaterFields)

    const formik = useFormik({
        enableReinitialize:true,
        validateOnMount: true,
        initialValues: {
            name: '',
            phone: '',
            address: '',
            details: '',
            issueDate: `${todayDate}`,
            dueDate: `${todayDate}`,
            items: repeaterFields
        },
        validationSchema: validation,
        onSubmit: (values) => {
            console.log(values)
            setOpen(true);
            // const data = [
            //     values.name, 
            //     values.phone, 
            //     values.amount, 
            //     values.address, 
            //     values.details
            // ]
            // const doc = new jsPDF();

            // doc.setTextColor(255, 255, 255); // Set text color to white
            // doc.setFillColor(0, 0, 255); // Set fill color to blue
            // // Header
            // const header = function() {
            //     doc.setFontSize(18);
            //     doc.setTextColor(30);
            //     const headerText = "BTC Japan";
            //     const textWidth = doc.getStringUnitWidth(headerText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
            //     const textX = (doc.internal.pageSize.width - textWidth) / 2;
            //     doc.text(headerText, textX, 12);
            // };
            // // Footer
            // const footer = function(data) {
            //     const pageCount = doc.internal.getNumberOfPages();
            //     doc.setFontSize(7);
            //     // doc.text(`Total Price: ${totalPrice}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
            //     doc.text("https://btcjapan.net", data.settings.margin.left, doc.internal.pageSize.height - 10);
            //     doc.text("Page " + data.pageNumber + " of " + pageCount, doc.internal.pageSize.width - data.settings.margin.right, doc.internal.pageSize.height - 10, { align: 'right' });
            // };
        
            // doc.autoTable({ head: [columns], body: data, styles: { cellPadding: {top: 4, bottom: 4, left: 2, right: 2}, }, margin: { top: 20, left: 5, right: 5 },
            // didDrawPage: function(data) {
            //     // Header
            //     header(data);
            //     // Footer
            //     footer(data);
            //     // totalCountPrice(data);
            // } });
            // doc.save('billbook.pdf');
        },
    });
    return(<>
        <MainCard title="Bill Book">
            <Container>
                <Box component="form" noValidate onSubmit={formik.handleSubmit} autoComplete="off">
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <FormControl required fullWidth error={Boolean(formik.touched.name && formik.errors.name)}>
                                <InputLabel htmlFor="name">Name</InputLabel>
                                <OutlinedInput
                                    id="name"
                                    type="text"
                                    value={formik.values.name}
                                    name="name"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Enter Name"
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <FormHelperText error id="standardname">
                                    {formik.errors.name}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="email">Email</InputLabel>
                                <OutlinedInput
                                    id="email"
                                    type="email "
                                    value={formik.values.email}
                                    name="email"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="email"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="phone">Phone</InputLabel>
                                <OutlinedInput
                                    id="phone"
                                    type="text"
                                    value={formik.values.phone}
                                    name="phone"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Phone"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="issueDate">Issue Date</InputLabel>
                                <OutlinedInput
                                    id="issueDate"
                                    type="date"
                                    value={formik.values.issueDate}
                                    name="issueDate"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Issue Date"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="dueDate">Due Date</InputLabel>
                                <OutlinedInput
                                    id="dueDate"
                                    type="date"
                                    value={formik.values.dueDate}
                                    name="dueDate"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Due Date"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="paymentTerms">Payment Terms</InputLabel>
                                <OutlinedInput
                                    id="paymentTerms"
                                    type="text"
                                    value={formik.values.paymentTerms}
                                    name="paymentTerms"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Payment Terms"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel id="currency">Select Currency</InputLabel>
                                <Select
                                    labelId="currency"
                                    id="currency"
                                    name="currency"
                                    value={formik.values.currency}
                                    label="Select Currency"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    <MenuItem value="">
                                        <em>Select Currency</em>
                                    </MenuItem>
                                    {currenciesList === null ? null : currenciesList.map((item, i)=>{
                                        return <MenuItem value={item.title} key={i}>{item.title}</MenuItem>;
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="tradeTerms">Trade Terms</InputLabel>
                                <OutlinedInput
                                    id="tradeTerms"
                                    type="text"
                                    value={formik.values.tradeTerms}
                                    name="tradeTerms"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Trade Terms"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="address">Address</InputLabel>
                                <OutlinedInput
                                    id="address"
                                    type="text"
                                    value={formik.values.address}
                                    name="address"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Address"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            {repeaterFields.map((field, index) => {
                                return (<>
                                    <DescriptionDetail onChange={(field, value) => repeaterHandleFieldChange(index, field, value)} field={field}  index={index} repeaterRemoveFields={repeaterRemoveFields} />
                                </>)
                            })}
                            <Stack direction="row" alignItems="center" justifyContent="flex-start" mt={2} style={{justifyContent: 'flex-end'}}>
                                <Button size="large" variant="contained" onClick={repeateraddFields}>Add New Item</Button>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} sm={12} style={{textAlign: 'right'}}>
                            <Button disableElevation size="large" type="submit" variant="contained" color="secondary">
                                Send
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </MainCard>
        <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className='share-options-popup'
      >
            <DialogTitle id="alert-dialog-title">
                {"Share With"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    <div className='share-options'>
                        <button type='button' className='btn'>
                            <img src="/SMS.png" alt="Mail Icon" />
                            <p>SMS</p>
                        </button>
                        <button type='button' className='btn'>
                            <img src="/WHATSAPP.png" alt="WHATSAPP Icon" />
                            <p>WhatsApp</p>
                        </button>
                        <button type='button' className='btn'>
                            <img src="/MAIL.png" alt="Mail Icon" />
                            <p style={{marginTop: 10}}>Gmail</p>
                        </button>
                    </div>
                </DialogContentText>
            </DialogContent>
            {/* <DialogActions>
                <Button onClick={handleClose}>Disagree</Button>
            </DialogActions> */}
        </Dialog>
    </>);
}



function DescriptionDetail(props){
    return(<>
        <Grid container spacing={2} key={props.index} sx={{mb: 3}}>
            <Grid item xs={12} sm={2}>
                <TextField 
                    name="name" 
                    label="Name" 
                    fullWidth
                    value={props.field.name}
                    onChange={(e) => props.onChange('name', e.target.value)}

                />
            </Grid>
            <Grid item xs={12} sm={2}>
                <TextField 
                    name="unitPrice" 
                    label="Unit Price" 
                    fullWidth
                    value={props.field.unitPrice}
                    onChange={(e) => props.onChange('unitPrice', e.target.value)}
                />
            </Grid>
            <Grid item xs={12} sm={2}>
                <TextField 
                    name="quantity" 
                    label="Quantity" 
                    fullWidth
                    value={props.field.quantity}
                    onChange={(e) => props.onChange('quantity', e.target.value)}

                />
            </Grid>
            <Grid item xs={12} sm={3}>
                <TextField 
                    name="description" 
                    label="Description" 
                    fullWidth
                    value={props.field.description}
                    onChange={(e) => props.onChange('description', e.target.value)}
                />
            </Grid>
            <Grid item xs={12} sm={2}>
                <TextField 
                    name="totalPrice" 
                    label="Total Price" 
                    fullWidth
                    disabled
                    value={props.field.totalPrice = props.field.quantity * props.field.unitPrice}
                    onChange={(e) => props.onChange('totalPrice', e.target.value)}
                />
            </Grid>
            {props.index < 1 ? null:<Grid item xs={12} sm={1}>
                <Button size="large" variant="contained" color="error" onClick={props.repeaterRemoveFields} style={{padding: '10px 13px', width: '100%'}}>Remove</Button>
            </Grid>}
        </Grid>
    </>)
}




export default BillBook;
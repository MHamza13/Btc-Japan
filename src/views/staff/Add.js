import React, {useEffect, useState} from 'react';
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
    Autocomplete,
    TextField,
} from '@mui/material';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCountryList } from 'store/country/countryActions';
import { useNavigate, useParams } from 'react-router';
import BackDropLoading from 'views/utilities/BackDropLoading';
import { addStaff, fetchEditStaffList, fetchSalaryTypeList, updateStaff } from 'store/staff/staffActions';
import moment from 'moment/moment';


const validation = yup.object({
    Name: yup
        .string('Enter Name')
        .required('Name is required'),
    PhoneNumber: yup
        .string('Enter Phone Number')
        .required('Phone Number is required'),
    Salary: yup
        .string('Enter Salary')
        .required('Salary is required'),
    SalaryTypeId: yup
        .string('Select Salary Type')
        .required('Salary Type is required'),
    WorkingHours: yup
        .string('Enter Working Hours')
        .required('Working Hours is required'),
    countryId: yup
        .string('Select Country')
        .required('Country is required'),
    IsActive: yup
        .string('Select Status')
        .required('Status is required'),
});




function StaffAdd(){
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const countryList = useSelector((state) => state.countries.list);
    const editStaffList = useSelector((state) => state.staff.stEditList);
    const staffSalaryTypeList = useSelector((state) => state.staff.salaryTypeList);
    const loading = useSelector((state) => state.staff.loading);
    const [country, setCountry] = useState(
        {
            id: 0,
            name: 'Select Country'
        }
    );

    useEffect(() => {
        dispatch(fetchCountryList());
        dispatch(fetchSalaryTypeList());
        if(id){
            dispatch(fetchEditStaffList(id));
        }
    }, [dispatch, id]);

    const todayDate = moment().format("YYYY-MM-DD");

    const joiningDateString = editStaffList.joiningDate;
    const joiningDatedateObject = moment(joiningDateString);
    const joiningDateformattedDate = joiningDatedateObject.format('YYYY-MM-DD');
    
    const formik = useFormik({
        enableReinitialize:true,
        validateOnMount: true,
        initialValues: {
            Id: id ? `${id}` : 0,
            Name: id ? `${editStaffList.name}` : '',
            PhoneNumber: id ? `${editStaffList.phoneNumber}` : '',
            CNIC: id ? `${editStaffList.cnic}` : '',
            JoiningDate: id ? `${joiningDateformattedDate}` : `${todayDate}`,
            Salary: id ? `${editStaffList.salary}` : '',
            WorkingHours: id ? `${editStaffList.workingHours}` : '',
            SalaryTypeId: id ? `${editStaffList.salaryTypeId}` : '',
            countryId: id ? `${editStaffList.countryId}` : `${country === null ? '' : country.id}`,
            IsActive: id ? `${editStaffList.isActive}` : '',
        },
        validationSchema: validation,
        onSubmit: (values) => {
            // setLoading(true)
            const formData = new FormData();
            for (const key in values) {
                formData.append(key, values[key]);
            }
            if(id){
                dispatch(updateStaff(id, formData, navigate))
            } else{
                dispatch(addStaff(formData, navigate))
            }
            // console.log(formData)
        },
    });

    return(<>
        {loading === true ? <BackDropLoading /> : null}
        <MainCard title="Add New Staff">
            <Container>
                <Box component="form" noValidate onSubmit={formik.handleSubmit} autoComplete="off">
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl required fullWidth error={Boolean(formik.touched.Name && formik.errors.Name)}>
                                <InputLabel htmlFor="Name">Name</InputLabel>
                                <OutlinedInput
                                    id="Name"
                                    type="text"
                                    value={formik.values.Name}
                                    name="Name"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Enter Name"
                                    inputProps={{}}
                                />
                                {formik.touched.Name && formik.errors.Name && (
                                    <FormHelperText error id="standardName">
                                    {formik.errors.Name}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl required fullWidth error={Boolean(formik.touched.PhoneNumber && formik.errors.PhoneNumber)}>
                                <InputLabel htmlFor="PhoneNumber">Phone Number</InputLabel>
                                <OutlinedInput
                                    id="PhoneNumber"
                                    type="text"
                                    value={formik.values.PhoneNumber}
                                    name="PhoneNumber"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Enter Phone Number"
                                    inputProps={{}}
                                />
                                {formik.touched.PhoneNumber && formik.errors.PhoneNumber && (
                                    <FormHelperText error id="standardPhoneNumber">
                                    {formik.errors.PhoneNumber}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="CNIC">CNIC</InputLabel>
                                <OutlinedInput
                                    id="CNIC"
                                    type="text"
                                    value={formik.values.CNIC}
                                    name="CNIC"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Enter CNIC"
                                    inputProps={{}}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="JoiningDate">Joining Date</InputLabel>
                                <OutlinedInput
                                    id="JoiningDate"
                                    type="date"
                                    value={formik.values.JoiningDate}
                                    name="JoiningDate"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Enter Joining Date"
                                    inputProps={{}}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl required fullWidth error={Boolean(formik.touched.Salary && formik.errors.Salary)}>
                                <InputLabel htmlFor="Salary">Salary</InputLabel>
                                <OutlinedInput
                                    id="Salary"
                                    type="text"
                                    value={formik.values.Salary}
                                    name="Salary"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Enter Joining Date"
                                    inputProps={{}}
                                />
                                {formik.touched.Salary && formik.errors.Salary && (
                                    <FormHelperText error id="standardSalary">
                                    {formik.errors.Salary}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl required fullWidth error={Boolean(formik.touched.WorkingHours && formik.errors.WorkingHours)}>
                                <InputLabel htmlFor="WorkingHours">Working Hours</InputLabel>
                                <OutlinedInput
                                    id="WorkingHours"
                                    type="text"
                                    value={formik.values.WorkingHours}
                                    name="WorkingHours"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Enter Working Hours"
                                    inputProps={{}}
                                />
                                {formik.touched.WorkingHours && formik.errors.WorkingHours && (
                                    <FormHelperText error id="standardWorkingHours">
                                    {formik.errors.WorkingHours}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl required fullWidth error={Boolean(formik.touched.SalaryTypeId && formik.errors.SalaryTypeId)}>
                                <InputLabel id="SalaryTypeId">Select Salary Type</InputLabel>
                                <Select
                                    labelId="SalaryTypeId"
                                    id="SalaryTypeId"
                                    name="SalaryTypeId"
                                    value={formik.values.SalaryTypeId}
                                    label="Select Salary Type"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    <MenuItem value="">
                                        <em>Select Salary Type</em>
                                    </MenuItem>
                                    {countryList === null ? null : staffSalaryTypeList.map((item, i)=>{
                                        return <MenuItem value={item.id} key={i}>{item.title}</MenuItem>;
                                    })}
                                </Select>
                                {formik.touched.SalaryTypeId && formik.errors.SalaryTypeId && (
                                    <FormHelperText error id="standardSalaryTypeId">
                                    {formik.errors.SalaryTypeId}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth error={Boolean(formik.touched.CountryId && formik.errors.CountryId)}>
                                <Autocomplete
                                    id="countryId"
                                    name="countryId"
                                    disablePortal
                                    fullWidth
                                    value={country}
                                    onChange={(event, newValue) => {
                                        setCountry(newValue);
                                    }}
                                    options={countryList}
                                    getOptionLabel={((option) => option.name )}
                                    renderInput={(params) => <TextField {...params} label="Select Country" />}
                                />
                                {formik.touched.CountryId && formik.errors.CountryId && (
                                    <FormHelperText error id="standardcountryId">
                                    {formik.errors.CountryId}
                                    </FormHelperText>
                                )}
                            </FormControl>
                            {/* <FormControl required fullWidth error={Boolean(formik.touched.countryId && formik.errors.countryId)}>
                                <InputLabel id="countryId">Select Country</InputLabel>
                                <Select
                                    labelId="countryId"
                                    id="countryId"
                                    name="countryId"
                                    value={formik.values.countryId}
                                    label="Select Country"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    <MenuItem value="">
                                        <em>Select Country</em>
                                    </MenuItem>
                                    {countryList === null ? null : countryList.map((item, i)=>{
                                        return <MenuItem value={item.id} key={i}>{item.name}</MenuItem>;
                                    })}
                                </Select>
                                {formik.touched.countryId && formik.errors.countryId && (
                                    <FormHelperText error id="standardcountryId">
                                    {formik.errors.countryId}
                                    </FormHelperText>
                                )}
                            </FormControl> */}
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl required fullWidth error={Boolean(formik.touched.IsActive && formik.errors.IsActive)}>
                                <InputLabel id="IsActive">Select Status</InputLabel>
                                <Select
                                    labelId="IsActive"
                                    id="IsActive"
                                    name="IsActive"
                                    value={formik.values.IsActive}
                                    label="Select Status"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    <MenuItem value=""><em>Select Country</em></MenuItem>
                                    <MenuItem value={true}>Active</MenuItem>
                                    <MenuItem value={false}>Deactivate</MenuItem>
                                </Select>
                                {formik.touched.IsActive && formik.errors.IsActive && (
                                    <FormHelperText error id="standardIsActive">
                                    {formik.errors.IsActive}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12} style={{textAlign: 'right'}}>
                            <Button disableElevation size="large" type="submit" variant="contained" color="secondary">
                                Submit
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </MainCard>
    </>);
}





export default StaffAdd;
import React, {useState, useEffect} from 'react';
// project imports
// import MainCard from 'ui-component/cards/MainCard';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
// import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
// import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import moment from 'moment/moment';
import Select from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
// import { visuallyHidden } from '@mui/utils';
// import { Link } from 'react-router-dom';
import { IconCaretDown } from '@tabler/icons';
import { useSelector, useDispatch } from 'react-redux';
import BackDropLoading from 'views/utilities/BackDropLoading';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Button, FormControl, InputLabel, Grid, FormHelperText, OutlinedInput } from '@mui/material';
import { addAttendanceStatus, fetchStaffAttendanceList, fetchStaffAttendanceStatusList, fetchStaffList } from 'store/staff/staffActions';
import { useFormik } from 'formik';
import * as yup from 'yup';




  
const headCells = [
    {
        id: 'name',
        numeric: false,
        disablePadding: false,
        label: 'Name',
        order: false
    },
    {
        id: 'salaryType',
        numeric: false,
        disablePadding: false,
        label: 'Salary Type',
        order: false
    },
    {
        id: 'perHourSalary',
        numeric: false,
        disablePadding: false,
        label: 'Per Hour Salary',
        order: false
    },
    {
        id: 'status',
        numeric: false,
        disablePadding: false,
        label: 'Status',
        order: false
    },
    {
        id: 'actions',
        numeric: true,
        disablePadding: false,
        label: 'Actions',
        order: false
    }
];
  
function EnhancedTableHead() {
  
    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                    >
                        {headCell.label}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}
  
EnhancedTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    rowCount: PropTypes.number.isRequired,
};
  
function EnhancedTableToolbar(props) {
    const { numSelected } = props;
    const todayDate = moment().format("YYYY-MM-DD");
    const [dateValue, setDateValue] = useState(moment(todayDate));
    const [staffId, setStaffID] = useState([])
    const dispatch = useDispatch();

    const inputDateString = dateValue;
    const inputDate = new Date(inputDateString);
    const outputDateString = moment(inputDate).format("YYYY-MM-DD");
    useEffect(() => {
        dispatch(fetchStaffAttendanceList(outputDateString, staffId));
        dispatch(fetchStaffList(staffId));
    }, [dispatch, outputDateString, staffId]);

    const staffIdhandleChange = (event) => {
        setStaffID(event.target.value);
    };

    const dateValuehandleChange = (event) => {
        setDateValue(event);
    };

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                    alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),
            }}
        >
            <Typography
                sx={{ flex: '1 1 100%' }}
                variant="h2"
                id="tableTitle"
                component="div"
            >
                Staff Attendace
            </Typography>

            <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker label="Filter by Date" value={dateValue} onChange={dateValuehandleChange} />
            </LocalizationProvider>
            <FormControl style={{width: '350px', marginLeft: '15px'}}>
                <InputLabel id="selectStaff">Filter by Staff</InputLabel>
                <Select
                    labelId="selectStaff"
                    id="selectStaff"
                    value={staffId}
                    label="Select Staff"
                    onChange={staffIdhandleChange}
                >
                    <MenuItem value=""><em>Select Staff</em></MenuItem>
                    {props.staffData.map((item, i)=>{
                        return (
                            item.isActive === true ?
                                <MenuItem value={item.id} key={i}>{item.name}</MenuItem>
                            : null
                        );
                    })}
                </Select>
            </FormControl>
        </Toolbar>
    );
}
  
EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
    staffData: PropTypes
};
  

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));


function StaffAttendace(){
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const dispatch = useDispatch();
    const todayDate = moment().format("YYYY-MM-DD");
    const loading = useSelector((state) => state.staff.loading);
    const staffData = useSelector((state) => state.staff.stlist);
    const staffAStatusList = useSelector((state) => state.staff.aStatusList);
    const staffAttendanceList = useSelector((state) => state.staff.sAttendanceList);
    const [overTimePopup, setOverTimePopup] = useState(false)
    const [lateTimePopup, setLateTimePopup] = useState(false)
    const [staffId, setStaffID] = useState(0)
    const [staffName, setStaffName] = useState(0)
    
    useEffect(() => {
        dispatch(fetchStaffList());
        dispatch(fetchStaffAttendanceStatusList());
        dispatch(fetchStaffAttendanceList());
    }, [dispatch]);
    

    
    const attendanceMark = (statusId, staffId) =>{
        const data = {
            Id: '0',
            StaffId: staffId,
            Status: statusId,
            Date: todayDate
        }
        dispatch(addAttendanceStatus(data));
    }


    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
        const newSelected = staffData.map((n) => n.id);
        setSelected(newSelected);
        return;
        }
        setSelected([]);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - staffData.length) : 0;
    

    const handelOverTimePopup = (staffId, staffName) =>{
        setOverTimePopup(true);
        setStaffID(staffId);
        setStaffName(staffName);
    }

    const handelLateTimePopup = (staffId, staffName) =>{
        setLateTimePopup(true);
        setStaffID(staffId);
        setStaffName(staffName);
    }
    

    return(<>
        {loading === true ? <BackDropLoading /> : null}
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <EnhancedTableToolbar numSelected={selected.length} staffData={staffData} />
                <TableContainer style={{overflowX: 'unset'}}>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size={'medium'}
                    >
                        <EnhancedTableHead
                            numSelected={selected.length}
                            // order={order}
                            // orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            // onRequestSort={handleRequestSort}
                            rowCount={staffData.length}
                        />
                        <TableBody>
                        {staffData.map((row, index) => {
                            const isItemSelected = isSelected(row.id);
                            const labelId = `enhanced-table-checkbox-${index}`;
                            
                            return (row.isActive === true ?
                            <TableRow
                                hover
                                role="checkbox"
                                aria-checked={isItemSelected}
                                tabIndex={-1}
                                key={row.id}
                                selected={isItemSelected}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell
                                    component="th"
                                    id={labelId}
                                    scope="row"
                                >
                                    {row.name}
                                </TableCell>
                                <TableCell align="left">{row.salaryType}</TableCell>
                                <TableCell align="left">{row.perHourSalary}</TableCell>
                                <TableCell align="left">
                                    {staffAttendanceList.map((item) =>{
                                        return item.staffId === row.id ? 
                                        item.status === 1 ? `Present (${row.workingHours} hrs)` : 
                                        item.status === 2 ? 'Absent (0 hrs)' : 
                                        item.status === 3 ? 'Paid Holiday' : 
                                        'Not Marked' : null;
                                    })}
                                </TableCell>
                                <TableCell align="right">
                                    <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                                        {staffAStatusList.map((item, i) =>{
                                            return(<>
                                                <Button variant="outlined" style={{minWidth: '40px'}} sx={{ml: 2}} onClick={()=> attendanceMark(item.id, row.id)} key={i}>
                                                    {item.title}
                                                </Button>
                                            </>)
                                        })}
                                        <div className='staff-menu'>
                                            <Button
                                                id="basic-button"
                                                variant="outlined"
                                                sx={{ml: 2}}
                                                style={{minWidth: '40px', padding: '6px 0'}}
                                            >
                                                <IconCaretDown />
                                            </Button>
                                            <ul className='staff-menu-list'>
                                                <li onClick={()=> handelOverTimePopup(row.id, row.name)}>Add Overtime</li>
                                                <li onClick={()=> handelLateTimePopup(row.id, row.name)}>Late Fine</li>
                                            </ul>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>: null 
                            );
                        })}
                        {emptyRows > 0 && (
                            <TableRow
                                style={{
                                    height: 53 * emptyRows,
                                }}
                            >
                                <TableCell colSpan={6} />
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[]}
                    component="div"
                    count={staffData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
        <OverTimeModal setOverTimePopup={setOverTimePopup} overTimePopup={overTimePopup} staffId={staffId} staffName={staffName} />
        <LateTimeModal staffId={staffId} staffName={staffName} lateTimePopup={lateTimePopup} setLateTimePopup={setLateTimePopup} />
    </>);
}

const validation = yup.object({
    OvertimeHours: yup
        .string('Enter Hours')
        .required('Hours is required'),
    OvertimeMinutes: yup
        .string('Enter Minutes')
        .required('Minutes is required'),
});

function OverTimeModal(props){
    const dispatch = useDispatch();
    const handleClose = () => {
        props.setOverTimePopup(false);
    };
    const formik = useFormik({
        enableReinitialize:true,
        validateOnMount: true,
        initialValues: {
            StaffId: props.staffId,
            OvertimeHours: '',
            OvertimeMinutes: ''
        },
        validationSchema: validation,
        onSubmit: (values) => {
            // console.log(values)
            const formData = new FormData();
            for (const key in values) {
                formData.append(key, values[key]);
            }
            dispatch(addAttendanceStatus(formData));
            handleClose()
        },
    });
    return(<>
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={props.overTimePopup}
        >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{fontSize: '20px'}}>
                Add Over Time ({props.staffName})
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
                            <FormControl required fullWidth error={Boolean(formik.touched.OvertimeHours && formik.errors.OvertimeHours)} style={{marginBottom: 15}}>
                                <InputLabel htmlFor="OvertimeHours">Over Time Hours</InputLabel>
                                <OutlinedInput
                                    id="OvertimeHours"
                                    type="text"
                                    value={formik.values.OvertimeHours}
                                    name="OvertimeHours"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Over Time Hours"
                                />
                                {formik.touched.OvertimeHours && formik.errors.OvertimeHours && (
                                    <FormHelperText error id="standardOvertimeHours">
                                    {formik.errors.OvertimeHours}
                                    </FormHelperText>
                                )}
                            </FormControl>
                            <FormControl required fullWidth error={Boolean(formik.touched.OvertimeMinutes && formik.errors.OvertimeMinutes)}>
                                <InputLabel htmlFor="OvertimeMinutes">Over Time Minutes</InputLabel>
                                <OutlinedInput
                                    id="OvertimeMinutes"
                                    type="text"
                                    value={formik.values.OvertimeMinutes}
                                    name="OvertimeMinutes"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Over Time Minutes"
                                />
                                {formik.touched.OvertimeMinutes && formik.errors.OvertimeMinutes && (
                                    <FormHelperText error id="standardOvertimeMinutes">
                                    {formik.errors.OvertimeMinutes}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus type='submit' variant="contained" color="secondary">
                        Add
                    </Button>
                </DialogActions>
            </Box>
        </BootstrapDialog>
    </>)
}

const lateValidation = yup.object({
    LateHours: yup
        .string('Enter Hours')
        .required('Hours is required'),
    LateMinutes: yup
        .string('Enter Minutes')
        .required('Minutes is required'),
});

function LateTimeModal(props){
    const dispatch = useDispatch();
    const handleClose = () => {
        props.setLateTimePopup(false);
    };
    const formik = useFormik({
        enableReinitialize:true,
        validateOnMount: true,
        initialValues: {
            StaffId: props.staffId,
            LateHours: '',
            LateMinutes: ''
        },
        validationSchema: lateValidation,
        onSubmit: (values) => {
            // console.log(values)
            const formData = new FormData();
            for (const key in values) {
                formData.append(key, values[key]);
            }
            dispatch(addAttendanceStatus(formData));
            handleClose()
        },
    });
    return(<>
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={props.lateTimePopup}
        >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{fontSize: '20px'}}>
                Add Late Fine ({props.staffName})
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
                            <FormControl required fullWidth error={Boolean(formik.touched.LateHours && formik.errors.LateHours)} style={{marginBottom: 15}}>
                                <InputLabel htmlFor="LateHours">Late Hours</InputLabel>
                                <OutlinedInput
                                    id="LateHours"
                                    type="text"
                                    value={formik.values.LateHours}
                                    name="LateHours"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Late Hours"
                                />
                                {formik.touched.LateHours && formik.errors.LateHours && (
                                    <FormHelperText error id="standardLateHours">
                                    {formik.errors.LateHours}
                                    </FormHelperText>
                                )}
                            </FormControl>
                            <FormControl required fullWidth error={Boolean(formik.touched.LateMinutes && formik.errors.LateMinutes)}>
                                <InputLabel htmlFor="LateMinutes">Late Minutes</InputLabel>
                                <OutlinedInput
                                    id="LateMinutes"
                                    type="text"
                                    value={formik.values.LateMinutes}
                                    name="LateMinutes"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Over Time Minutes"
                                />
                                {formik.touched.LateMinutes && formik.errors.LateMinutes && (
                                    <FormHelperText error id="standardLateMinutes">
                                    {formik.errors.LateMinutes}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus type='submit' variant="contained" color="secondary">
                        Add
                    </Button>
                </DialogActions>
            </Box>
        </BootstrapDialog>
    </>)
}



export default StaffAttendace;
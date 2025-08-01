import React, {useState, useEffect} from 'react';
// project imports
// import MainCard from 'ui-component/cards/MainCard';
import PropTypes from 'prop-types';
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
// import { visuallyHidden } from '@mui/utils';
// import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import BackDropLoading from 'views/utilities/BackDropLoading';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { Button, FormControl, InputLabel, } from '@mui/material';
import { fetchStaffList, fetchStaffSalaryList,
    processSalary 
} from 'store/staff/staffActions';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';




  
const headCells = [
    {
        id: 'date',
        numeric: false,
        disablePadding: false,
        label: 'Date',
        order: false
    },
    {
        id: 'name',
        numeric: false,
        disablePadding: false,
        label: 'Name',
        order: false
    },
    {
        id: 'salary',
        numeric: false,
        disablePadding: false,
        label: 'Salary',
        order: false
    },
    {
        id: 'closingBalance',
        numeric: false,
        disablePadding: false,
        label: 'Closing Balance',
        order: false
    },
    {
        id: 'remainingBalance',
        numeric: false,
        disablePadding: false,
        label: 'Remaining Balance',
        order: false
    },
    {
        id: 'paidAmount',
        numeric: false,
        disablePadding: false,
        label: 'Paid Amount',
        order: false
    },
    {
        id: 'workingHours',
        numeric: false,
        disablePadding: false,
        label: 'Working Hours',
        order: false
    },
    {
        id: 'overtimeHours',
        numeric: false,
        disablePadding: false,
        label: 'Over Time',
        order: false
    },
    {
        id: 'lateHours',
        numeric: false,
        disablePadding: false,
        label: 'Late Hours',
        order: false
    },
    {
        id: 'paymentDate',
        numeric: false,
        disablePadding: false,
        label: 'Payment Date',
        order: false
    },
    {
        id: 'attendanceStatus',
        numeric: false,
        disablePadding: false,
        label: 'Attendance Status',
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




function StaffSalary(){
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const dispatch = useDispatch();
    const todayDate = moment().format("YYYY-MM-DD");
    const loading = useSelector((state) => state.staff.loading);
    const staffData = useSelector((state) => state.staff.stlist);
    // const staffAttendanceList = useSelector((state) => state.staff.sAttendanceList);
    const staffSalaryList = useSelector((state) => state.staff.sSalaryList);
    const sortedData = [...staffSalaryList].sort((a, b) => new Date(b.date) - new Date(a.date));
    const [staffId, setStaffID] = useState([])

    const staffIdhandleChange = (event) => {
        setStaffID(event.target.value);
    };
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 2);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    // Format the dates in 'YYYY-MM-DD' format
    const formattedFirstDayOfMonth = firstDayOfMonth.toISOString().slice(0, 10);
    const formattedLastDayOfMonth = lastDayOfMonth.toISOString().slice(0, 10);
    const [datevalue, setDateValue] = useState([formattedFirstDayOfMonth, formattedLastDayOfMonth]);
    
    // console.log(formattedFirstDayOfMonth, formattedLastDayOfMonth)
    
    const dateHandelChange = (e) =>{
        const formattedDateArray = e.map(date => {
            const isoString = date.toISOString();
            return isoString.split('T')[0];
        });
        setDateValue(formattedDateArray)
        // console.log(formattedDateArray)
    }
    
    useEffect(() => {
        dispatch(fetchStaffList());
        dispatch(fetchStaffSalaryList(staffId, datevalue))
    }, [dispatch, staffId, datevalue]);
    

    

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
        const newSelected = staffSalaryList.map((n) => n.id);
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
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - staffSalaryList.length) : 0;

    const getRemainingBalance = staffSalaryList.map((n) => n.remainingBalance);

    const handelSalaryProccess = (staffId, remainingBalance) =>{
        const data = {
            StaffId: staffId,
            PaidAmount: remainingBalance,
            PaymentDate: todayDate
        }
        dispatch(processSalary(data, staffId, datevalue))
        // console.log(data)
    }
    // console.log(getID)
    
   
    return(<>
        {loading === true ? <BackDropLoading /> : null}
        
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <Toolbar
                    sx={{
                        pl: { sm: 2 },
                        pr: { xs: 1, sm: 1 }
                    }}
                >
                    
                        <Typography
                            sx={{ flex: '1 1 33%' }}
                            variant="h2"
                            id="tableTitle"
                            component="div"
                        >
                            Staff Salary
                        </Typography>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <h2>Salary: {getRemainingBalance[0]}</h2>
                            <Button size="large" variant="contained" color="secondary" onClick={()=> handelSalaryProccess(staffId, getRemainingBalance[0])} style={{margin: '0 15px'}}>Process Salary</Button>
                            <DateRangePicker onChange={dateHandelChange} value={datevalue} />
                            <FormControl style={{width: '300px', marginLeft: '15px'}}>
                                <InputLabel id="selectStaff">Filter by Staff</InputLabel>
                                <Select
                                    labelId="selectStaff"
                                    id="selectStaff"
                                    value={staffId}
                                    label="Select Staff"
                                    onChange={staffIdhandleChange}
                                >
                                    <MenuItem value=''>Select Staff</MenuItem>
                                    {staffData.map((item, i)=>{
                                        return (
                                            item.isActive === true ?
                                                <MenuItem value={item.id} key={i}>{item.name}</MenuItem>
                                            : null
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </div>
                </Toolbar>
                <TableContainer>
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
                            rowCount={staffSalaryList.length}
                        />
                        <TableBody>
                        {sortedData.map((row, index) => {
                            const isItemSelected = isSelected(row.id);
                            const labelId = `enhanced-table-checkbox-${index}`;
                            
                            return (
                            <TableRow
                                hover
                                role="checkbox"
                                aria-checked={isItemSelected}
                                tabIndex={-1}
                                key={row.id}
                                selected={isItemSelected}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell align="left">{row.date ? moment(row.date).subtract(1, 'days').format('YYYY-MM-DD') : null} </TableCell>
                                <TableCell align="left" id={labelId}>{row.staffName}</TableCell>
                                <TableCell align="left">{row.salary}</TableCell>
                                <TableCell align="left">{row.closingBalance}</TableCell>
                                <TableCell align="left">{row.remainingBalance}</TableCell>
                                <TableCell align="left">{row.paidAmount}</TableCell>
                                <TableCell align="left">{row.workingHours} hrs</TableCell>
                                <TableCell align="left">{row.overtimeHours}:{row.overtimeMinutes} hrs</TableCell>
                                <TableCell align="left">{row.lateHours}:{row.lateMinutes} hrs</TableCell>
                                <TableCell align="left">{row.paymentDate ? moment(row.paymentDate).subtract(1, 'days').format('YYYY-MM-DD') : null} </TableCell>
                                <TableCell align="left">{row.attendanceStatus}</TableCell>
                            </TableRow>
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
                    count={staffSalaryList.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    </>);
}






export default StaffSalary;
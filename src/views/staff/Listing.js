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
import IconButton from '@mui/material/IconButton';
// import { visuallyHidden } from '@mui/utils';
import { Link } from 'react-router-dom';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons';
import { useSelector, useDispatch } from 'react-redux';
import BackDropLoading from 'views/utilities/BackDropLoading';
import { Button } from '@mui/material';
import { fetchStaffList, staffDelete } from 'store/staff/staffActions';




  
const headCells = [
    {
        id: 'name',
        numeric: false,
        disablePadding: false,
        label: 'Name',
        order: false
    },
    {
        id: 'cnic',
        numeric: false,
        disablePadding: false,
        label: 'Cnic',
        order: false
    },
    {
        id: 'phoneNumber',
        numeric: false,
        disablePadding: false,
        label: 'Phone Number',
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
        id: 'salaryType',
        numeric: false,
        disablePadding: false,
        label: 'Salary Type',
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
                Staff Listing
            </Typography>
            <Link to="/staff/add">
                <Button size="large" type="button" variant="contained" color="secondary" style={{minWidth: '180px'}}>
                    <IconPlus style={{marginRight: '10px'}} /> Add New Staff
                </Button>
            </Link>
        </Toolbar>
    );
}
  
EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
};
  




function StaffListing(){
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.staff.loading);
    const userData = useSelector((state) => state.user.user);
    
    useEffect(() => {
        dispatch(fetchStaffList());
    }, [dispatch]);

    const staffData = useSelector((state) => state.staff.stlist);


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

    const deleteStaff = (id) => {
        dispatch(staffDelete(id));
    }

    return(<>
        {loading === true ? <BackDropLoading /> : null}
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <EnhancedTableToolbar numSelected={selected.length} />
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
                            rowCount={staffData.length}
                        />
                        <TableBody>
                        {staffData.map((row, index) => {
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
                                <TableCell
                                    component="th"
                                    id={labelId}
                                    scope="row"
                                >
                                    {row.name}
                                </TableCell>
                                <TableCell align="left">{row.cnic}</TableCell>
                                <TableCell align="left">{row.phoneNumber}</TableCell>
                                <TableCell align="left">{row.salary}</TableCell>
                                <TableCell align="left">{row.salaryType}</TableCell>
                                <TableCell align="left">{row.workingHours} hrs</TableCell>
                                <TableCell align="left">{row.perHourSalary}</TableCell>
                                <TableCell align="left">{row.isActive ? 'Active' : 'Deactivate'}</TableCell>
                                <TableCell align="right">
                                        <Link to={`/staff/edit/${row.id}`}>
                                            <IconButton size="small" color="dark">
                                                <IconEdit />
                                            </IconButton>
                                        </Link>
                                        {userData.userRole === 'SuperAdmin' ? <>
                                        <IconButton size="small" sx={{ color: 'error.main' }} onClick={()=> deleteStaff(row.id)}>
                                            <IconTrash />
                                        </IconButton></>:null}
                                </TableCell>
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
                    count={staffData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    </>);
}





export default StaffListing;
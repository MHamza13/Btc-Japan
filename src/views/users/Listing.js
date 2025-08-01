import React, {useEffect, useState} from 'react';
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
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import { Link } from 'react-router-dom';
import { 
    IconPlus, 
    // IconEdit, 
    IconTrash 
} from '@tabler/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsersList, userDelete } from 'store/user/userActions';
import BackDropLoading from 'views/utilities/BackDropLoading';
import { Button } from '@mui/material';



  
function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}
  
function getComparator(order, orderBy) {
    return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}
  

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}
  
const headCells = [
    {
        id: 'name',
        numeric: false,
        disablePadding: false,
        label: 'Name',
        order: true
    },
    {
        id: 'username',
        numeric: false,
        disablePadding: false,
        label: 'User Name',
        order: false
    },
    {
        id: 'country',
        numeric: false,
        disablePadding: false,
        label: 'Country',
        order: false
    },
    {
        id: 'role',
        numeric: false,
        disablePadding: false,
        label: 'Role',
        order: false
    },
    {
        id: 'actions',
        numeric: true,
        disablePadding: false,
        label: 'Actions',
        order: false
    },
];
  
function EnhancedTableHead(props) {
    const { orderBy,  onRequestSort } =
      props;
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };
  
    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                    >
                        {headCell.order === true ? 
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                        </TableSortLabel>
                        : headCell.label}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}
  
EnhancedTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
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
                Users Listing
            </Typography>
    
            <Link to="/user/add">
                <Button size="large" type="button" variant="contained" color="secondary" style={{minWidth: '180px'}}>
                    <IconPlus style={{marginRight: '10px'}} /> Add New User
                </Button>
            </Link>
        </Toolbar>
    );
}
  
EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
};
  




function UserListing(){
    const dispatch = useDispatch();
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('name');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const usersList = useSelector((state) => state.user.userList);
    const loading = useSelector((state) => state.countries.loading);

    useEffect(()=>{
        dispatch(fetchUsersList())
    }, [dispatch])
    
    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
        const newSelected = usersList.map((n) => n.id);
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
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - usersList.length) : 0;

    const visibleRows = React.useMemo(
        () =>
        stableSort(usersList, getComparator(order, orderBy)).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage,
        ),
        [order, orderBy, page, rowsPerPage, usersList],
    );

    const deleteUser = (id) => {
        dispatch(userDelete(id));
    }
    return(<>
        {loading ? <BackDropLoading /> : null}
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
                        order={order}
                        orderBy={orderBy}
                        onSelectAllClick={handleSelectAllClick}
                        onRequestSort={handleRequestSort}
                        rowCount={usersList.length}
                        />
                        <TableBody>
                        {visibleRows.map((row, index) => {
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
                                    {row.fullName}
                                </TableCell>
                                <TableCell align="left">{row.userName}</TableCell>
                                <TableCell align="left">{row.countryName}</TableCell>
                                <TableCell align="left">{row.userRole}</TableCell>
                                <TableCell align="right">
                                        {/* <Link to={`/dashboard/user/edit/`}>
                                            <IconButton size="small" color="dark">
                                                <IconEdit />
                                            </IconButton>
                                        </Link> */}
                                        {row.userRole !== 'SuperAdmin' ? 
                                        <IconButton size="small" sx={{ color: 'error.main' }} onClick={()=> deleteUser(row.userId)}>
                                            <IconTrash />
                                        </IconButton>:null}
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
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={usersList.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    </>);
}




export default UserListing;
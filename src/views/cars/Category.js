import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import { Button, Chip, TextField } from '@mui/material';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons';
import PropTypes from 'prop-types';
import { fetchCategoryList, deleteCategory } from '../../store/category/categoryAction';
import BackDropLoading from 'views/utilities/BackDropLoading';
import { imageUrl } from 'utils/ApiUrls';

// Update headCells to match the actual field name 'imagePath'
const headCells = [
  { id: 'categoryName', numeric: false, disablePadding: false, label: 'Category Name' },
  { id: 'description', numeric: false, disablePadding: false, label: 'Description' },
  { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
  { id: 'imagePath', numeric: false, disablePadding: false, label: 'Image' },
  { id: 'actions', numeric: true, disablePadding: false, label: 'Actions' }
];

// EnhancedTableHead component
function EnhancedTableHead(props) {
  const { userRole } = props; 

  // Filter out the 'Actions' column if userRole is 'MainAdmin'
  const visibleHeadCells = userRole === 'MainAdmin' 
    ? headCells.filter((headCell) => headCell.id !== 'actions') 
    : headCells;

  return (
    <TableHead>
      <TableRow>
        {visibleHeadCells.map((headCell) => (
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
  userRole: PropTypes.string.isRequired // Add userRole to propTypes
};

// EnhancedTableToolbar component
function EnhancedTableToolbar(props) {
  const { numSelected, searchTerm, handleSearchChange } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity)
        })
      }}
    >
      <Typography sx={{ flex: '1 1 100%' }} variant="h2" id="tableTitle" component="div">
        Vehicle Categories
      </Typography>
      <TextField
        id="outlined-basic"
        label="Search Category"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ marginRight: 20, width: 300 }}
      />
      <Link to="/vehicles/add-category">
        <Button size="large" type="button" variant="contained" color="secondary" style={{ minWidth: '160px' }}>
          <IconPlus /> Add Category
        </Button>
      </Link>
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  searchTerm: PropTypes.string.isRequired,
  handleSearchChange: PropTypes.func.isRequired
};

function Category() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.category.loading);
  const categoryData = useSelector((state) => state.category.categoryList);
  const userData = useSelector((state) => state.user.user);

  useEffect(() => {
    dispatch(fetchCategoryList());
  }, [dispatch]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredData = categoryData.filter(
    (item) =>
      item.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredData.length) : 0;

  const deleteCategoryHandler = (id) => {
    dispatch(deleteCategory(id));
  };

  return (
    <>
      {loading === true ? <BackDropLoading /> : null}
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <EnhancedTableToolbar numSelected={0} searchTerm={searchTerm} handleSearchChange={handleSearchChange} />
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
              <EnhancedTableHead numSelected={0} userRole={userData.userRole} /> {/* Pass userRole */}
              <TableBody>
                {(rowsPerPage > 0 ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : filteredData).map((row) => {
                  const imageSrc = row.imagePath
                    ? `${imageUrl}${row.imagePath.startsWith('/') ? row.imagePath.substring(1) : row.imagePath}`
                    : null;
                  console.log(`Row ID: ${row.id}, Image Path: ${row.imagePath}, Full URL: ${imageSrc}`); // Debug log

                  return (
                    <TableRow hover tabIndex={-1} key={row.id}>
                      <TableCell align="left">{row.categoryName}</TableCell>
                      <TableCell align="left">{row.description}</TableCell>
                      <TableCell align="left">
                        <Chip
                          label={row.status === 'active' ? 'Active' : 'Inactive'}
                          color={row.status === 'active' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell align="left">
                        {row.imagePath ? (
                          <>
                            <img
                              src={imageSrc}
                              alt={row.categoryName}
                              style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                display: 'block'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none'; // Hide the image
                              }}
                            />
                            <span
                              style={{ color: '#666', display: 'none' }} // Initially hidden
                            >
                              No Image
                            </span>
                          </>
                        ) : (
                          <span style={{ color: '#666' }}>No Image</span>
                        )}
                      </TableCell>
                      {userData.userRole !== 'MainAdmin' && ( // Conditionally render actions column
                        <TableCell align="right">
                          <Link to={`/vehicles/category/edit/${row.id}`}>
                            <IconButton size="small" color="dark">
                              <IconEdit />
                            </IconButton>
                          </Link>
                          <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => deleteCategoryHandler(row.id)}>
                            <IconTrash />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={userData.userRole === 'MainAdmin' ? 4 : 5} /> {/* Adjust colSpan */}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </>
  );
}

export default Category;
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  IconButton,
  Button,
  TextField,
} from '@mui/material';
import { IconPlus, IconTrash, IconEdit } from '@tabler/icons';
import BackDropLoading from 'views/utilities/BackDropLoading';
import { fetchStationList, deleteStation } from '../../store/station/StationAction';
import { fetchCountryList } from '../../store/country/countryActions';
import { imageUrl } from 'utils/ApiUrls';
import { fetchCarList } from 'store/car/carActions';

// Sorting functions
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// Updated table headers
const headCells = [
  { id: 'dpPath', numeric: false, disablePadding: false, label: 'Profile Picture', order: false },
  { id: 'stationName', numeric: false, disablePadding: false, label: 'Station Name', order: true },
  { id: 'city', numeric: false, disablePadding: false, label: 'city', order: false },
  { id: 'carCount', numeric: true, disablePadding: false, label: 'Number of Cars', order: true },
  { id: 'totalPurchasePrice', numeric: true, disablePadding: false, label: 'Total Purchase Price', order: true },
  { id: 'actions', numeric: true, disablePadding: false, label: 'Actions', order: false },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort, userRole } = props;
  const createSortHandler = (property) => (event) => onRequestSort(event, property);

  const visibleHeadCells = userRole === 'MainAdmin' ? headCells.filter((headCell) => headCell.id !== 'actions') : headCells;

  return (
    <TableHead>
      <TableRow>
        {visibleHeadCells.map((headCell) => (
          <TableCell key={headCell.id} align={headCell.numeric ? 'right' : 'left'} padding={headCell.disablePadding ? 'none' : 'normal'}>
            {headCell.order ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  userRole: PropTypes.string.isRequired,
};

function EnhancedTableToolbar({ onSearchChange }) {
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Typography sx={{ flex: '0 0 auto' }} variant="h2" id="tableTitle" component="div">
        Stations Listing
      </Typography>
      <Box sx={{ display: 'flex', gap: '20px' }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search stations..."
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ flex: '1 1 300px', maxWidth: '400px' }}
        />
        <Link to="/station/add">
          <Button size="large" variant="contained" color="secondary" style={{ minWidth: '160px' }}>
            <IconPlus style={{ marginRight: '10px' }} /> Add Station
          </Button>
        </Link>
      </Box>
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  onSearchChange: PropTypes.func.isRequired,
};

const StationListing = () => {
  const dispatch = useDispatch();
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('stationName');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const userData = useSelector((state) => state.user.user);
  const stationsList = useSelector((state) => state.stations.list || []);
  const countriesList = useSelector((state) => state.countries.list || []);
  const carDataMain = useSelector((state) => state.car.calist || []);
  const loading = useSelector((state) => state.stations.loading || state.countries.loading || state.car.loading);

  useEffect(() => {
    dispatch(fetchStationList());
    dispatch(fetchCountryList());
    dispatch(fetchCarList());
  }, [dispatch]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCountryFilter = (countryId) => {
    setSelectedCountryId(countryId === '' ? '' : Number(countryId));
    setPage(0);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPage(0);
  };

  const deleteStationHandler = async (id) => {
    await dispatch(deleteStation(id));
    dispatch(fetchStationList()); // Refresh the station list after deletion
  };

  const stationStats = useMemo(() => {
    const stats = {};
    carDataMain.forEach((car) => {
      const stationId = Number(car.stationId);
      if (!stats[stationId]) {
        stats[stationId] = {
          carCount: 0,
          totalPurchasePrice: 0,
        };
      }
      stats[stationId].carCount += 1;
      stats[stationId].totalPurchasePrice += parseFloat(car.purchasePrice) || 0;
    });
    return stats;
  }, [carDataMain]);

  const countryStationCounts = useMemo(() => {
    const counts = {};
    stationsList.forEach((station) => {
      const countryId = Number(station.country);
      counts[countryId] = (counts[countryId] || 0) + 1;
    });
    return counts;
  }, [stationsList]);

  const relevantCountries = useMemo(() => {
    const stationCountryIds = new Set(stationsList.map((station) => Number(station.country)));
    return countriesList.filter((country) => stationCountryIds.has(country.id));
  }, [countriesList, stationsList]);

  const filteredStations = useMemo(() => {
    const enrichedStations = stationsList.map((station) => {
      const country = countriesList.find((c) => c.id === Number(station.country));
      const stats = stationStats[station.id] || { carCount: 0, totalPurchasePrice: 0 };
      return {
        ...station,
        countryName: country ? country.name : 'Unknown',
        carCount: stats.carCount,
        totalPurchasePrice: stats.totalPurchasePrice,
      };
    });

    let filtered = enrichedStations;
    if (selectedCountryId !== '') {
      filtered = filtered.filter((station) => Number(station.country) === selectedCountryId);
    }
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (station) => station.stationName.toLowerCase().includes(lowerSearch) || station.countryName.toLowerCase().includes(lowerSearch)
      );
    }
    return filtered;
  }, [stationsList, countriesList, selectedCountryId, searchTerm, stationStats]);

  const visibleRows = useMemo(
    () => stableSort(filteredStations, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, filteredStations]
  );

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredStations.length) : 0;

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <>
      {loading ? <BackDropLoading /> : null}
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <EnhancedTableToolbar onSearchChange={handleSearchChange} />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', p: 2 }}>
            <Button
              variant={selectedCountryId === '' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => handleCountryFilter('')}
              sx={{ minWidth: '100px' }}
            >
              All Countries ({stationsList.length})
            </Button>
            {relevantCountries.map((country) => (
              <Button
                key={country.id}
                variant={selectedCountryId === country.id ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => handleCountryFilter(country.id)}
                sx={{ minWidth: '100px' }}
              >
                <img src={country.flag} alt="" style={{ marginRight: '10px' }} />
                {country.name} ({countryStationCounts[country.id] || 0})
              </Button>
            ))}
          </Box>
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="medium">
              <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} userRole={userData.userRole} />
              <TableBody>
                {visibleRows.map((row) => {
                  const imageSrc = row.dpPath ? `${imageUrl}${row.dpPath.startsWith('/') ? row.dpPath.substring(1) : row.dpPath}` : null;

                  return (
                    <TableRow hover tabIndex={-1} key={row.id}>
                      <TableCell align="left">
                        {row.dpPath ? (
                          <img
                            src={imageSrc}
                            alt={row.stationName}
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        ) : (
                          <span style={{ color: '#666' }}>No Image</span>
                        )}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {row.stationName}
                      </TableCell>
                      <TableCell align="left">{row.city}</TableCell>
                      <TableCell align="right">{row.carCount}</TableCell>
                      <TableCell align="right">{formatNumber(row.totalPurchasePrice.toFixed(2))}</TableCell>
                      {userData.userRole !== 'MainAdmin' && (
                        <TableCell align="right">
                          <Link to={`/station/add/${row.id}`}>
                            <IconButton size="small" color="primary" title="Update">
                              <IconEdit />
                            </IconButton>
                          </Link>
                          <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => deleteStationHandler(row.id)} title="Delete">
                            <IconTrash />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={userData.userRole === 'MainAdmin' ? 5 : 6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredStations.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </>
  );
};

export default StationListing;
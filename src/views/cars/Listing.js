import React, { useState, useEffect } from 'react';
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
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Link, useNavigate } from 'react-router-dom';
import { IconArrowsMove, IconEdit, IconEye, IconMapPin, IconPlus, IconTrash, IconZoomMoney, IconShoppingCart } from '@tabler/icons';
import { useSelector, useDispatch } from 'react-redux';
import { carDelete, fetchCarList, fetchTermPaymentsList } from 'store/car/carActions';
import BackDropLoading from 'views/utilities/BackDropLoading';
import { Button, Chip, TextField, Dialog, DialogContent, DialogActions } from '@mui/material';
import AddExpenses from './AddExpenses';
import ViewExpense from './ViewExpense';
import CarSales from './CarSales';
import CarLocation from './CarLocation';
import { imageUrl } from 'utils/ApiUrls';
import TermPayments from './TermPayments';
import MoveCar from './MoveCar';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import headerImgData from '../../assets/images/in-header-bg.png';
import imgData from '../../assets/images/in-footer-bg.png';
import paymentImage from '../../assets/images/in-accounts-details.png';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import { fetchStationList } from 'store/station/StationAction';
import { fetchCategoryList } from 'store/category/categoryAction';
import { fetchCountryList } from 'store/country/countryActions';

// Updated headCells with 'moved' column
const headCells = [
  { id: 'image', numeric: false, disablePadding: false, label: 'Gallery Image', order: false },
  { id: 'model', numeric: false, disablePadding: false, label: 'Vehicle Name', order: false },
  { id: 'chassisNo', numeric: false, disablePadding: false, label: 'Chassis No', order: false },
  { id: 'isAvailable', numeric: false, disablePadding: false, label: 'Available', order: false },
  { id: 'moved', numeric: false, disablePadding: false, label: 'Moved', order: false }, // New column
  { id: 'actions', numeric: true, disablePadding: false, label: 'Actions', order: false }
];

function EnhancedTableHead() {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell key={headCell.id} align={headCell.numeric ? 'right' : 'left'} padding={headCell.disablePadding ? 'none' : 'normal'}>
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
  rowCount: PropTypes.number.isRequired
};

function EnhancedTableToolbar(props) {
  const { numSelected, searchTerm, handleSearchChange, handlePreviewAllCarsPDF } = props;
  const userData = useSelector((state) => state.user.user);

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
        Vehicles
      </Typography>
      <Tooltip title="Preview All Vehicles PDF">
        <IconButton color="secondary" onClick={handlePreviewAllCarsPDF} sx={{ mr: 2 }}>
          <PictureAsPdfIcon />
        </IconButton>
      </Tooltip>
      <TextField
        id="outlined-basic"
        label="Search Vehicles"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mr: 2, width: { xs: '100%', sm: 300 } }}
      />
      {userData.userRole === 'SuperAdmin' && (
        <Link to="/vehicles/add">
          <Button size="large" type="button" variant="contained" color="secondary" sx={{ minWidth: '160px', whiteSpace: 'nowrap' }}>
            <IconPlus /> Add Vehicles
          </Button>
        </Link>
      )}
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  searchTerm: PropTypes.string.isRequired,
  handleSearchChange: PropTypes.func.isRequired,
  handlePreviewAllCarsPDF: PropTypes.func.isRequired
};

function CarListing() {
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [salesOpen, setSaleseOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((state) => state.car.loading);
  const [carID, setCarID] = useState(0);
  const [carName, setCarName] = useState('');
  const [carStatus, setCarStatus] = useState(0);
  const [expenseViewOpen, setExpenseViewOpen] = useState(false);
  const [termPaymentsOpen, setTermPaymentsOpen] = useState(false);
  const [saleCurrency, setSaleCurrency] = useState('');
  const [pendingPayment, setPendingPayment] = useState(0);
  const [carLocationPopup, setCarLocationPopup] = useState(false);
  const [moveCar, setMoveCar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStationId, setSelectedStationId] = useState('');
  const [selectedcountiesId, setSelectedcountiesId] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [pdfBlob, setPdfBlob] = useState(null);
  const userData = useSelector((state) => state.user.user);
  const carDataMain = useSelector((state) => state.car.calist || []);
  const termPaymentList = useSelector((state) => state.car.termPList || []);
  const categoryList = useSelector((state) => state.category.categoryList || []);
  const stationList = useSelector((state) => state.stations.list || []);
  const countriesList = useSelector((state) => state.countries.list || []);

  console.log(pdfBlob);

  useEffect(() => {
    dispatch(fetchCarList());
    dispatch(fetchCategoryList());
    dispatch(fetchStationList());
    dispatch(fetchCountryList());
  }, [dispatch]);

  const handleClickTermPaymentsOpen = (id, carName, currency, carStatus) => {
    setCarID(id);
    setCarName(carName);
    setSaleCurrency(currency);
    setCarStatus(carStatus);
    dispatch(fetchTermPaymentsList(id)).then(() => {
      const car = carDataMain.find((c) => c.id === id);
      const purchasePrice = parseFloat(car?.purchasePrice) || 0;
      const totalPaid = termPaymentList
        .filter((payment) => payment.carId === id)
        .reduce((sum, payment) => sum + (parseFloat(payment.cashIn) || 0), 0);
      const updatedPending = purchasePrice - totalPaid;
      setPendingPayment(updatedPending);
      setTermPaymentsOpen(true);
    });
  };

  const handleClickExpenseOpen = (id, currency) => {
    setExpenseOpen(true);
    setCarID(id);
    setSaleCurrency(currency);
  };

  const handleClickSaleseOpen = (id, carName, currency) => {
    setSaleseOpen(true);
    setCarID(id);
    setCarName(carName);
    setSaleCurrency(currency);
  };

  const handleClickExpenseViewOpen = (id, carName, carStatus) => {
    setExpenseViewOpen(true);
    setCarID(id);
    setCarName(carName);
    setCarStatus(carStatus);
  };

  const handleClickCarLocationPopupOpen = (id, carName, carStatus) => {
    setCarLocationPopup(true);
    setCarID(id);
    setCarName(carName);
    setCarStatus(carStatus);
  };

  const handleClickMoveCareOpen = (id) => {
    setMoveCar(true);
    setCarID(id);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = carDataMain.map((n) => n.id);
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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleCategoryFilter = (categoryName) => {
    setSelectedCategory(categoryName);
    setPage(0);
  };

  const handleStationFilter = (stationId) => {
    setSelectedStationId(stationId === '' ? '' : Number(stationId));
    setPage(0);
  };

  const handleCountryFilter = (countiesId) => {
    setSelectedcountiesId(countiesId === '' ? '' : Number(countiesId));
    setPage(0);
  };

  const sortedData = [...carDataMain].sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

  const filteredData = sortedData
    .filter((item) => (selectedCategory ? item.category === selectedCategory : true))
    .filter((item) => (selectedStationId ? item.stationId === selectedStationId : true))
    .filter((item) => (selectedcountiesId ? Number(item.countiesId) === selectedcountiesId : true))
    .filter(
      (item) =>
        item.chassisNo.toLowerCase().includes(searchTerm.toLowerCase()) || item.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const categoryVehicleCounts = React.useMemo(() => {
    const counts = {};
    carDataMain.forEach((vehicle) => {
      const category = vehicle.category || '';
      if (category) counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
  }, [carDataMain]);

  const stationVehicleCounts = React.useMemo(() => {
    const counts = {};
    carDataMain.forEach((vehicle) => {
      const stationId = Number(vehicle.stationId);
      if (!isNaN(stationId) && stationId > 0) counts[stationId] = (counts[stationId] || 0) + 1;
    });
    return counts;
  }, [carDataMain]);

  const countryVehicleCounts = React.useMemo(() => {
    const counts = {};
    carDataMain.forEach((vehicle) => {
      const countiesId = Number(vehicle.countiesId);
      if (!isNaN(countiesId) && countiesId > 0) counts[countiesId] = (counts[countiesId] || 0) + 1;
    });
    return counts;
  }, [carDataMain]);

  const totalCategories = React.useMemo(() => {
    const uniqueCategories = new Set(carDataMain.map((vehicle) => vehicle.category).filter(Boolean));
    return uniqueCategories.size;
  }, [carDataMain]);

  const totalStations = React.useMemo(() => {
    const uniqueStations = new Set(carDataMain.map((vehicle) => Number(vehicle.stationId)).filter((id) => !isNaN(id) && id > 0));
    return uniqueStations.size;
  }, [carDataMain]);

  const totalCountries = React.useMemo(() => {
    const uniqueCountries = new Set(carDataMain.map((vehicle) => Number(vehicle.countiesId)).filter((id) => !isNaN(id) && id > 0));
    return uniqueCountries.size;
  }, [carDataMain]);

  const relevantCountries = React.useMemo(() => {
    const vehiclecountiesIds = new Set(carDataMain.map((vehicle) => Number(vehicle.countiesId)).filter((id) => !isNaN(id) && id > 0));
    return countriesList.filter((country) => vehiclecountiesIds.has(country.id));
  }, [countriesList, carDataMain]);

  const getCategoryImage = (categoryName) => {
    const category = categoryList.find((cat) => cat.categoryName === categoryName);
    return category && category.imagePath ? `${imageUrl}/${category.imagePath}` : null;
  };

  const relevantCategories = React.useMemo(() => {
    const vehicleCategories = new Set(carDataMain.map((vehicle) => vehicle.category).filter(Boolean));
    return categoryList
      .filter((category) => vehicleCategories.has(category.categoryName))
      .map((category) => ({
        categoryName: category.categoryName,
        image: getCategoryImage(category.categoryName)
      }));
  }, [carDataMain, categoryList]);

  const relevantStations = React.useMemo(() => {
    const vehicleStationIds = new Set(carDataMain.map((vehicle) => Number(vehicle.stationId)).filter((id) => !isNaN(id) && id > 0));
    return stationList.filter((station) => vehicleStationIds.has(station.id));
  }, [stationList, carDataMain]);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredData.length) : 0;

  const deleteCar = (id) => {
    dispatch(carDelete(id));
  };

  const handleRowClick = (id) => {
    navigate(`/vehicles/details/${id}`);
  };

  const addThousandSeparator = (number) => {
    return number?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';
  };

  const generateCarPDF = (car, isPreview = false) => {
    const fileName = `${car.model} - Vehicle Details`;
    const rows = [];
    const purchaseAmount = car.purchasePrice || 0;
    const purchasePending = car.purchasePending || 0;

    rows.push([
      { content: car.model, fontStyle: 'bold' },
      { content: `${addThousandSeparator(purchaseAmount)} ${car.purchaseCurrency}`, fontStyle: 'bold' },
      { content: car.isAvailable ? 'Available' : 'Sold Out', fontStyle: 'bold' },
      { content: car.stationId && car.stationId !== 0 ? 'Moved' : '' } // Only show 'Moved' if true
    ]);
    if (purchasePending > 0) {
      rows.push([
        { content: 'Pending Payment', fontStyle: 'bold' },
        { content: `${addThousandSeparator(purchasePending)} ${car.purchaseCurrency}`, fontStyle: 'bold' },
        { content: '', fontStyle: 'bold' },
        { content: '' }
      ]);
    }

    const totalAmount = purchaseAmount;
    rows.push(['', '', '', '']);
    rows.push(['', 'Total Amount:', addThousandSeparator(totalAmount), '']);

    const doc = new jsPDF();
    const header = function () {
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.addImage(headerImgData, 'PNG', 0, 0, doc.internal.pageSize.width, 35);
      doc.setFontSize(12);
      doc.setTextColor(232, 45, 45);
      doc.text('Vehicle Details:', 5, 41);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(25);
      doc.text(car.model, 5, 50);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Chassis No: ${car.chassisNo || 'N/A'}`, 5, 55);
      doc.text(`Purchase Date: ${new Date(car.purchaseDate).toLocaleDateString() || 'N/A'}`, 5, 60);
      doc.text(`Agent ID: ${userData.userName}`, doc.internal.pageSize.width - 5, 70, { align: 'right' });
    };

    const footer = function () {
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.addImage(imgData, 'PNG', 0, doc.internal.pageSize.height - 20, doc.internal.pageSize.width, 20.1);
      doc.text('https://btcjapan.net', doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 2.5, { align: 'right' });
    };

    doc.autoTable({
      head: [['Vehicle Name', 'Amount', 'Status', 'Moved']],
      body: rows,
      styles: { cellPadding: { top: 2, bottom: 2, left: 2, right: 2 }, fontSize: 10 },
      headerStyles: { fillColor: [49, 103, 177], fontSize: 11 },
      margin: { top: 73, left: 5, right: 5 },
      didDrawPage: function (data) {
        header(data);
        footer(data);
      },
      didParseCell: function (data) {
        const rows = data.table.body;
        if (data.row.index === rows.length - 1) {
          data.cell.styles.fillColor = '#fff';
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 11;
          data.cell.styles.textColor = '#e82d2d';
        }
      }
    });

    const imageX = 5;
    const imageY = doc.autoTable.previous.finalY + 5;
    const imageWidth = 200;
    const imageHeight = 50;
    doc.addImage(paymentImage, 'PNG', imageX, imageY, imageWidth, imageHeight);

    if (isPreview) {
      const pdfBlob = doc.output('blob');
      setPdfBlob(pdfBlob);
      setPreviewUrl(URL.createObjectURL(pdfBlob));
    } else {
      doc.save(`${fileName}.pdf`);
    }
  };

  const generateAllCarsPDF = (cars, isPreview = false) => {
    const fileName = 'All Vehicles Listing';
    const rows = [];
    let totalAmount = 0;

    cars.forEach((car, index) => {
      const purchaseAmount = car.purchasePrice || 0;
      const purchasePending = car.purchasePending || 0;

      rows.push([
        { content: `${index + 1}. ${car.model}`, fontStyle: 'bold' },
        { content: `${addThousandSeparator(purchaseAmount)} ${car.purchaseCurrency}`, fontStyle: 'bold' },
        { content: car.isAvailable ? 'Available' : 'Sold Out', fontStyle: 'bold' },
        { content: car.stationId && car.stationId !== 0 ? 'Moved' : '' } // Only show 'Moved' if true
      ]);
      if (purchasePending > 0) {
        rows.push([
          { content: 'Pending Payment', fontStyle: 'bold' },
          { content: `${addThousandSeparator(purchasePending)} ${car.purchaseCurrency}`, fontStyle: 'bold' },
          { content: '', fontStyle: 'bold' },
          { content: '' }
        ]);
      }
      totalAmount += purchaseAmount;
    });

    rows.push(['', '', '', '']);
    rows.push(['', 'Total Amount:', addThousandSeparator(totalAmount), '']);

    const doc = new jsPDF();
    const header = function () {
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.addImage(headerImgData, 'PNG', 0, 0, doc.internal.pageSize.width, 35);
      doc.setFontSize(12);
      doc.setTextColor(232, 45, 45);
      doc.text('Vehicles Listing:', 5, 41);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(25);
      doc.text('All Vehicles', 5, 50);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Agent ID: ${userData.userName}`, doc.internal.pageSize.width - 5, 70, { align: 'right' });
    };

    const footer = function () {
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.addImage(imgData, 'PNG', 0, doc.internal.pageSize.height - 20, doc.internal.pageSize.width, 20.1);
      doc.text('https://btcjapan.net', doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 2.5, { align: 'right' });
    };

    doc.autoTable({
      head: [['Vehicle Name', 'Amount', 'Status', 'Moved']],
      body: rows,
      styles: { cellPadding: { top: 2, bottom: 2, left: 2, right: 2 }, fontSize: 10 },
      headerStyles: { fillColor: [49, 103, 177], fontSize: 11 },
      margin: { top: 73, left: 5, right: 5 },
      didDrawPage: function (data) {
        header(data);
        footer(data);
      },
      didParseCell: function (data) {
        const rows = data.table.body;
        if (data.row.index === rows.length - 1) {
          data.cell.styles.fillColor = '#fff';
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 11;
          data.cell.styles.textColor = '#e82d2d';
        }
      }
    });

    const imageX = 5;
    const imageY = doc.autoTable.previous.finalY + 5;
    const imageWidth = 200;
    const imageHeight = 50;
    doc.addImage(paymentImage, 'PNG', imageX, imageY, imageWidth, imageHeight);

    if (isPreview) {
      const pdfBlob = doc.output('blob');
      setPdfBlob(pdfBlob);
      setPreviewUrl(URL.createObjectURL(pdfBlob));
    } else {
      doc.save(`${fileName}.pdf`);
    }
  };

  const handlePreviewCarPDF = (car) => {
    setPreviewType('single');
    generateCarPDF(car, true);
    setPreviewOpen(true);
  };

  const handlePreviewAllCarsPDF = () => {
    setPreviewType('all');
    generateAllCarsPDF(filteredData, true);
    setPreviewOpen(true);
  };

  const handleDownload = () => {
    if (previewType === 'single') {
      generateCarPDF(
        filteredData.find((car) => car.id === carID),
        false
      );
    } else if (previewType === 'all') {
      generateAllCarsPDF(filteredData, false);
    }
    setPreviewOpen(false);
    URL.revokeObjectURL(previewUrl);
  };

  const getFirstGalleryImage = (galleryImages) => {
    if (!galleryImages || galleryImages === '') return null;
    try {
      const images = typeof galleryImages === 'string' ? galleryImages.split(',') : Array.isArray(galleryImages) ? galleryImages : [];
      return images.length > 0 ? images[0].trim() : null;
    } catch (e) {
      console.error('Failed to parse galleryImages:', e);
      return null;
    }
  };

  // Function to determine if a car has been moved
  const isCarMoved = (car) => {
    return car.isMoved === true || false;
  };

  return (
    <>
      {loading && <BackDropLoading />}
      <AddExpenses expenseOpen={expenseOpen} setExpenseOpen={setExpenseOpen} carID={carID} saleCurrency={saleCurrency} />
      <CarSales salesOpen={salesOpen} setSaleseOpen={setSaleseOpen} carID={carID} carName={carName} saleCurrency={saleCurrency} />
      <ViewExpense
        expenseViewOpen={expenseViewOpen}
        setExpenseViewOpen={setExpenseViewOpen}
        carID={carID}
        carName={carName}
        carStatus={carStatus}
      />
      <CarLocation
        carLocationPopup={carLocationPopup}
        setCarLocationPopup={setCarLocationPopup}
        carID={carID}
        carName={carName}
        carStatus={carStatus}
      />
      <TermPayments
        termPaymentsOpen={termPaymentsOpen}
        setTermPaymentsOpen={setTermPaymentsOpen}
        carID={carID}
        carName={carName}
        saleCurrency={saleCurrency}
        carStatus={carStatus}
        pendingPayment={pendingPayment}
        showAddTermsButton={true}
        paymentType="vendor"
        onAddPayment={(payment) => {
          const updatedPending = pendingPayment - (parseFloat(payment.cashIn) || 0);
          setPendingPayment(updatedPending);
        }}
      />
      <MoveCar moveCar={moveCar} setMoveCar={setMoveCar} carID={carID} />
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 3, height: '80vh' }}>
          {previewUrl ? (
            <iframe src={previewUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Preview" />
          ) : (
            <Typography>Loading PDF preview...</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPreviewOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDownload} variant="contained" color="secondary">
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <EnhancedTableToolbar
            numSelected={selected.length}
            handleSearchChange={handleSearchChange}
            searchTerm={searchTerm}
            handlePreviewAllCarsPDF={handlePreviewAllCarsPDF}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', p: 2 }}>
            <Button
              variant={selectedCategory === '' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => handleCategoryFilter('')}
              sx={{ minWidth: '100px', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              All Categories ({totalCategories})
            </Button>
            {relevantCategories.map((category) => (
              <Button
                key={category.categoryName}
                variant={selectedCategory === category.categoryName ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => handleCategoryFilter(category.categoryName)}
                sx={{ minWidth: '100px', display: 'flex', alignItems: 'center', gap: 1 }}
              >
                {category.image ? (
                  <img src={category.image} alt={category.categoryName} style={{ width: '20px', height: '20px', objectFit: 'cover' }} />
                ) : (
                  <ImageNotSupportedIcon sx={{ fontSize: 20 }} />
                )}
                {category.categoryName} ({categoryVehicleCounts[category.categoryName] || 0})
              </Button>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', p: 2 }}>
            <Button
              variant={selectedStationId === '' ? 'contained' : 'outlined'}
              color="secondary"
              onClick={() => handleStationFilter('')}
              sx={{ minWidth: '100px' }}
            >
              All Stations ({totalStations})
            </Button>
            {relevantStations.map((station) => (
              <Button
                key={station.id}
                variant={selectedStationId === station.id ? 'contained' : 'outlined'}
                color="secondary"
                onClick={() => handleStationFilter(station.id)}
                sx={{ minWidth: '100px' }}
              >
                {station.stationName} ({stationVehicleCounts[station.id] || 0})
              </Button>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', p: 2 }}>
            <Button
              variant={selectedcountiesId === '' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => handleCountryFilter('')}
              sx={{ minWidth: '100px', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              All Countries ({totalCountries})
            </Button>
            {relevantCountries.map((country) => (
              <Button
                key={country.id}
                variant={selectedcountiesId === country.id ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => handleCountryFilter(country.id)}
                sx={{ minWidth: '100px', display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <img src={country.flag} alt={country.name} style={{ width: '20px', height: 'auto', marginRight: '10px' }} />
                {country.name} ({countryVehicleCounts[country.id] || 0})
              </Button>
            ))}
          </Box>
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
              <EnhancedTableHead numSelected={selected.length} onSelectAllClick={handleSelectAllClick} rowCount={filteredData.length} />
              <TableBody>
                {(rowsPerPage > 0 ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : filteredData).map(
                  (row, index) => {
                    const isItemSelected = isSelected(row.id);
                    const labelId = `enhanced-table-checkbox-${index}`;
                    const firstGalleryImage = getFirstGalleryImage(row.galleryImages);

                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.id}
                        selected={isItemSelected}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleRowClick(row.id)}
                      >
                        <TableCell align="left">
                          {firstGalleryImage ? (
                            <a href={`${imageUrl}/${firstGalleryImage}`} target="_blank" rel="noreferrer">
                              <img src={`${imageUrl}/${firstGalleryImage}`} alt="Gallery Image" style={{ width: '50px' }} />
                            </a>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ImageNotSupportedIcon sx={{ color: '#757575' }} />
                              <Typography variant="body2" color="textSecondary">
                                No Image
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell id={labelId}>{row.model}</TableCell>
                        <TableCell align="left">{row.chassisNo}</TableCell>
                        <TableCell align="left">
                          {row.isAvailable ? <Chip label="Available" color="info" /> : <Chip label="Sold Out" color="error" />}
                        </TableCell>
                        <TableCell align="left">{isCarMoved(row) ? <Chip label="Moved" color="success" /> : null}</TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <Tooltip title="Preview PDF">
                            <IconButton size="small" color="secondary" onClick={() => handlePreviewCarPDF(row)}>
                              <PictureAsPdfIcon />
                            </IconButton>
                          </Tooltip>
                          {['SuperAdmin', 'MainAdmin'].includes(userData.userRole) && (
                            <>
                              <Tooltip title="Car Location">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleClickCarLocationPopupOpen(row.id, row.model, row.isAvailable);
                                  }}
                                >
                                  <IconMapPin />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="View Expenses">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleClickExpenseViewOpen(row.id, row.model, row.isAvailable);
                                  }}
                                >
                                  <IconEye />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {userData.userRole === 'SuperAdmin' && (
                            <>
                              {row.isAvailable ? (
                                <>
                                  <Tooltip title="Add Expense">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleClickExpenseOpen(row.id, row.purchaseCurrency);
                                      }}
                                    >
                                      <IconPlus />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Move Car to Station">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleClickMoveCareOpen(row.id);
                                      }}
                                    >
                                      <IconArrowsMove />
                                    </IconButton>
                                  </Tooltip>
                                  <Link to={`/vehicles/edit/${row.id}`}>
                                    <IconButton size="small" color="dark">
                                      <IconEdit />
                                    </IconButton>
                                  </Link>
                                  <IconButton
                                    size="small"
                                    sx={{ color: 'error.main' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteCar(row.id);
                                    }}
                                  >
                                    <IconTrash />
                                  </IconButton>
                                  <Tooltip title="Sale Car">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleClickSaleseOpen(row.id, row.model, row.purchaseCurrency);
                                      }}
                                      disabled={userData.userRole === 'Admin' || userData.userRole === 'AgentStock'}
                                    >
                                      <IconShoppingCart />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Vendor Term Payments">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleClickTermPaymentsOpen(row.id, row.model, row.purchaseCurrency, row.isAvailable);
                                      }}
                                    >
                                      <IconZoomMoney />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              ) : (
                                <>
                                  <IconButton
                                    size="small"
                                    sx={{ color: 'error.main' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteCar(row.id);
                                    }}
                                  >
                                    <IconTrash />
                                  </IconButton>
                                  <Tooltip title="Vendor Term Payments">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleClickTermPaymentsOpen(row.id, row.model, row.purchaseCurrency, row.isAvailable);
                                      }}
                                    >
                                      <IconZoomMoney />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
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

export default CarListing;

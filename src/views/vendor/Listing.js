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
import { Link } from 'react-router-dom';
import { IconEdit, IconPlus, IconTrash, IconEye } from '@tabler/icons';
import { useSelector, useDispatch } from 'react-redux';
import { vendorDelete, fetchVendorList, fetchVendorLedgerList } from 'store/vendor/vendorActions';
import { fetchCountryList } from 'store/country/countryActions';
import BackDropLoading from 'views/utilities/BackDropLoading';
import { Button, TextField, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Swal from 'sweetalert2';
import { imageUrl } from 'utils/ApiUrls';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import headerImgData from '../../assets/images/in-header-bg.png';
import imgData from '../../assets/images/in-footer-bg.png';
import paymentImage from '../../assets/images/in-accounts-details.png';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const headCells = [
  { id: 'dp', numeric: false, disablePadding: false, label: 'DP', order: false },
  { id: 'name', numeric: false, disablePadding: false, label: 'Name', order: false },
  { id: 'amount', numeric: true, disablePadding: false, label: 'Deposite Amount', order: false },
  { id: 'actions', numeric: true, disablePadding: false, label: 'Actions', order: false }
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
            sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
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
  rowCount: PropTypes.number.isRequired
};

function EnhancedTableToolbar(props) {
  const { numSelected, searchTerm, handleSearchChange, handlePreviewAllVendorsPDF } = props;
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
        Vendors Listing
      </Typography>
      <Tooltip title="Preview All Vendors PDF">
        <IconButton color="secondary" onClick={handlePreviewAllVendorsPDF} sx={{ mr: 2 }}>
          <PictureAsPdfIcon />
        </IconButton>
      </Tooltip>
      <TextField
        id="outlined-basic"
        label="Search Vendor"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mr: 2, width: { xs: '100%', sm: 300 } }}
      />
      {userData.userRole !== 'Admin' && userData.userRole !== 'AgentSales' && (
        <Link to="/vendor/add">
          <Button size="large" type="button" variant="contained" color="secondary" sx={{ minWidth: '160px', whiteSpace: 'nowrap' }}>
            <IconPlus sx={{ mr: 1 }} /> Add Vendor
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
  handlePreviewAllVendorsPDF: PropTypes.func.isRequired
};

function VendorsListing() {
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const userData = useSelector((state) => state.user.user);
  const vendorDataMain = useSelector((state) => state.vendor.vlist || []);
  const countriesList = useSelector((state) => state.countries.list || []);
  const loading = useSelector((state) => state.vendor.loading || false);
  const [enrichedVendors, setEnrichedVendors] = useState([]);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [currentPdfType, setCurrentPdfType] = useState(null); // 'single' or 'all'
  const [currentVendor, setCurrentVendor] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([dispatch(fetchVendorList()), dispatch(fetchCountryList())]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setEnrichedVendors([]);
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    const updateEnrichedData = async () => {
      try {
        const vendorIds = vendorDataMain.map((vendor) => vendor.id);
        const ledgerResponses = await Promise.all(vendorIds.map((id) => dispatch(fetchVendorLedgerList(id))));

        const ledgerMap = ledgerResponses.reduce((acc, response, index) => {
          acc[vendorIds[index]] =
            response.payload && response.payload.length > 0
              ? {
                  pendingPurchaseAmount: response.payload[0].pendingPurchaseAmount || 0,
                  paymentMade: response.payload[0].paymentMade || 0
                }
              : { pendingPurchaseAmount: 0, paymentMade: 0 };
          return acc;
        }, {});

        const enrichedData = vendorDataMain.map((vendor) => {
          const country = countriesList.find((c) => c.id === Number(vendor.countryId));
          return {
            ...vendor,
            pendingPurchaseAmount: ledgerMap[vendor.id]?.pendingPurchaseAmount || 0,
            paymentMade: ledgerMap[vendor.id]?.paymentMade || 0,
            depositAmount: vendor.advanceAmount || 0,
            countryName: country ? country.name : 'Unknown'
          };
        });

        setEnrichedVendors(enrichedData);
      } catch (error) {
        console.error('Error updating enriched vendors:', error);
        setEnrichedVendors([]);
      }
    };

    if (vendorDataMain.length > 0 && countriesList.length > 0) {
      updateEnrichedData();
    }
  }, [vendorDataMain, countriesList, dispatch]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredVendors.map((n) => n.id);
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

  const handleCountryFilter = (countryId) => {
    setSelectedCountryId(countryId === '' ? '' : Number(countryId));
    setPage(0);
  };

  const deleteVendor = (id) => {
    dispatch(fetchVendorLedgerList(id)).then((response) => {
      if (response.payload && response.payload.length > 0) {
        Swal.fire({
          title: 'Warning!',
          text: 'You cannot delete a Vendor; this Vendor has a car.',
          icon: 'warning'
        });
      } else {
        dispatch(vendorDelete(id)).then(() => {
          dispatch(fetchVendorList());
        });
      }
    });
  };

  const addThousandSeparator = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const filteredVendors = React.useMemo(() => {
    let filtered = enrichedVendors;
    if (selectedCountryId !== '') {
      filtered = enrichedVendors.filter((vendor) => Number(vendor.countryId) === selectedCountryId);
    }
    return filtered.filter((item) => item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
  }, [enrichedVendors, selectedCountryId, searchTerm]);

  const sortedData = [...filteredVendors].sort((a, b) => new Date(b.recUpdatedDt) - new Date(a.recUpdatedDt));
  const vendorData = rowsPerPage > 0 ? sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : sortedData;
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredVendors.length) : 0;

  const countryVendorCounts = React.useMemo(() => {
    const counts = {};
    enrichedVendors.forEach((vendor) => {
      const countryId = Number(vendor.countryId);
      counts[countryId] = (counts[countryId] || 0) + 1;
    });
    return counts;
  }, [enrichedVendors]);

  const relevantCountries = React.useMemo(() => {
    const vendorCountryIds = new Set(enrichedVendors.map((vendor) => Number(vendor.countryId)));
    return countriesList.filter((country) => vendorCountryIds.has(country.id));
  }, [countriesList, enrichedVendors]);

  // Common PDF generation function
  const generateVendorPDF = (vendor = null, isPreview = false) => {
    setPdfLoading(true);
    const doc = new jsPDF();
    let fileName, rows, totalAmount;

    if (vendor) {
      // Single vendor PDF
      fileName = `${vendor.title} - Vendor Details`;
      rows = [];
      const absolutePendingAmount = Math.abs(vendor.pendingPurchaseAmount || 0);
      const depositAmount = vendor.depositAmount || 0;
      const paymentMade = vendor.paymentMade || 0;

      if (depositAmount > 0) {
        rows.push([
          { content: vendor.title, fontStyle: 'bold' },
          { content: `${addThousandSeparator(depositAmount)} ${vendor.currency}`, fontStyle: 'bold' },
          { content: 'You will Pay', fontStyle: 'bold' }
        ]);
        if (paymentMade > 0) {
          rows.push([
            { content: 'Payment Made', fontStyle: 'bold' },
            { content: `${addThousandSeparator(paymentMade)} ${vendor.currency}`, fontStyle: 'bold' },
            { content: '', fontStyle: 'bold' }
          ]);
        }
        totalAmount = depositAmount;
      } else {
        rows.push([
          { content: vendor.title, fontStyle: 'bold' },
          { content: `${addThousandSeparator(absolutePendingAmount)} ${vendor.currency}`, fontStyle: 'bold' },
          { content: 'You will give', fontStyle: 'bold' }
        ]);
        totalAmount = absolutePendingAmount;
      }
      rows.push(['', '', '']);
      rows.push(['', 'Total Amount:', addThousandSeparator(totalAmount)]);

      const header = function () {
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.addImage(headerImgData, 'PNG', 0, 0, doc.internal.pageSize.width, 35);
        doc.setFontSize(12);
        doc.setTextColor(232, 45, 45);
        doc.text('Invoice to:', 5, 41);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(25);
        doc.text(vendor.title, 5, 50);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Vendor ID: ${vendor.registrationNo || 'N/A'}`, 5, 55);
        doc.text(`Phone: ${vendor.contactNumber || 'N/A'}`, 5, 60);
        doc.text(`Email: ${vendor.email || 'N/A'}`, 5, 65);
        doc.text(`Address: ${vendor.address || 'N/A'}`, 5, 70);
        doc.text(`Agent ID: ${userData.userName}`, doc.internal.pageSize.width - 5, 70, { align: 'right' });
      };

      doc.autoTable({
        head: [['Name', 'Amount', 'Status']],
        body: rows,
        styles: { cellPadding: { top: 2, bottom: 2, left: 2, right: 2 }, fontSize: 10 },
        headerStyles: { fillColor: [49, 103, 177], fontSize: 11 },
        margin: { top: 73, left: 5, right: 5 },
        didDrawPage: header
      });
    } else {
      // All vendors PDF
      fileName = 'All Vendors Listing';
      rows = [];
      totalAmount = 0;

      filteredVendors.forEach((vendor, index) => {
        const absolutePendingAmount = Math.abs(vendor.pendingPurchaseAmount || 0);
        const depositAmount = vendor.depositAmount || 0;
        const paymentMade = vendor.paymentMade || 0;

        if (depositAmount > 0) {
          rows.push([
            { content: `${index + 1}. ${vendor.title}`, fontStyle: 'bold' },
            { content: `${addThousandSeparator(depositAmount)} ${vendor.currency}`, fontStyle: 'bold' },
            { content: 'You will Pay', fontStyle: 'bold' }
          ]);
          if (paymentMade > 0) {
            rows.push([
              { content: 'Payment Made', fontStyle: 'bold' },
              { content: `${addThousandSeparator(paymentMade)} ${vendor.currency}`, fontStyle: 'bold' },
              { content: '', fontStyle: 'bold' }
            ]);
          }
          totalAmount += depositAmount;
        } else {
          rows.push([
            { content: `${index + 1}. ${vendor.title}`, fontStyle: 'bold' },
            { content: `${addThousandSeparator(absolutePendingAmount)} ${vendor.currency}`, fontStyle: 'bold' },
            { content: 'You will give', fontStyle: 'bold' }
          ]);
          totalAmount += absolutePendingAmount;
        }
      });

      rows.push(['', '', '']);
      rows.push(['', 'Total Amount:', addThousandSeparator(totalAmount)]);

      const header = function () {
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.addImage(headerImgData, 'PNG', 0, 0, doc.internal.pageSize.width, 35);
        doc.setFontSize(12);
        doc.setTextColor(232, 45, 45);
        doc.text('Invoice to:', 5, 41);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(25);
        doc.text('All Vendors', 5, 50);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Agent ID: ${userData.userName}`, doc.internal.pageSize.width - 5, 70, { align: 'right' });
      };

      doc.autoTable({
        head: [['Name', 'Amount', 'Status']],
        body: rows,
        styles: { cellPadding: { top: 2, bottom: 2, left: 2, right: 2 }, fontSize: 10 },
        headerStyles: { fillColor: [49, 103, 177], fontSize: 11 },
        margin: { top: 73, left: 5, right: 5 },
        didDrawPage: header
      });
    }

    const footer = function () {
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.addImage(imgData, 'PNG', 0, doc.internal.pageSize.height - 20, doc.internal.pageSize.width, 20.1);
      doc.text('https://btcjapan.net', doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 2.5, { align: 'right' });
    };

    doc.autoTable({
      didDrawPage: footer,
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
    if (imageY + 50 > doc.internal.pageSize.height - 20) {
      doc.addPage();
      if (vendor) {
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.addImage(headerImgData, 'PNG', 0, 0, doc.internal.pageSize.width, 35);
        doc.setFontSize(12);
        doc.setTextColor(232, 45, 45);
        doc.text('Invoice to:', 5, 41);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(25);
        doc.text(vendor.title, 5, 50);
      } else {
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.addImage(headerImgData, 'PNG', 0, 0, doc.internal.pageSize.width, 35);
        doc.setFontSize(12);
        doc.setTextColor(232, 45, 45);
        doc.text('Invoice to:', 5, 41);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(25);
        doc.text('All Vendors', 5, 50);
      }
    }
    doc.addImage(paymentImage, 'PNG', imageX, imageY, 200, 50);

    if (isPreview) {
      const pdfBlob = doc.output('blob');
      setPdfPreviewUrl(URL.createObjectURL(pdfBlob));
    } else {
      doc.save(`${fileName}.pdf`);
    }
    setPdfLoading(false);
  };

  const handlePreviewVendorPDF = (vendor) => {
    setCurrentPdfType('single');
    setCurrentVendor(vendor);
    generateVendorPDF(vendor, true);
    setPdfPreviewOpen(true);
  };

  const handlePreviewAllVendorsPDF = () => {
    setCurrentPdfType('all');
    setCurrentVendor(null);
    generateVendorPDF(null, true);
    setPdfPreviewOpen(true);
  };

  const handleDownloadPDF = () => {
    generateVendorPDF(currentVendor, false);
    setPdfPreviewOpen(false);
    URL.revokeObjectURL(pdfPreviewUrl);
  };

  const handleClosePreview = () => {
    setPdfPreviewOpen(false);
    setPdfPreviewUrl('');
    setCurrentPdfType(null);
    setCurrentVendor(null);
  };

  return (
    <>
      {loading && <BackDropLoading />}
      <Box sx={{ width: '100%', p: { xs: 1, sm: 2 } }}>
        <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
          <EnhancedTableToolbar
            numSelected={selected.length}
            handleSearchChange={handleSearchChange}
            searchTerm={searchTerm}
            handlePreviewAllVendorsPDF={handlePreviewAllVendorsPDF}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', p: 2 }}>
            <Button
              variant={selectedCountryId === '' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => handleCountryFilter('')}
              sx={{ minWidth: '100px' }}
            >
              All Countries ({enrichedVendors.length})
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
                {country.name} ({countryVendorCounts[country.id] || 0})
              </Button>
            ))}
          </Box>
          <TableContainer sx={{}}>
            <Table sx={{ minWidth: 500 }} aria-labelledby="tableTitle" size="medium" stickyHeader>
              <EnhancedTableHead numSelected={selected.length} onSelectAllClick={handleSelectAllClick} rowCount={filteredVendors.length} />
              <TableBody>
                {vendorData.map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;
                  const absolutePendingAmount = Math.abs(row.pendingPurchaseAmount || 0);
                  const paymentMade = row.paymentMade || 0;
                  const depositAmount = row.depositAmount || 0;

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
                      <TableCell align="left">
                        <img
                          src={row.frontCard ? `${imageUrl}Vender/${row.frontCard}` : '.'}
                          alt="Dp"
                          style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                        />
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row">
                        <Link
                          to={`/vendor/details/${row.id}`}
                          state={{
                            vendorID: row.id,
                            vendorName: row.title,
                            advanceAmount: row.advanceAmount,
                            vendorLedgerData: [row.registrationNo, row.email, row.contactNumber, row.address]
                          }}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          {row.title}
                        </Link>
                      </TableCell>
                      <TableCell align="right">
                        {depositAmount > 0 ? (
                          <>
                            <Typography variant="body1" sx={{ color: 'red', fontWeight: 'bold' }}>
                              {row.currency} {addThousandSeparator(depositAmount)}
                            </Typography>

                            {paymentMade > 0 && (
                              <Typography variant="body2" sx={{ color: 'red', fontWeight: 'bold', mt: 1 }}>
                                {row.currency} {addThousandSeparator(paymentMade)}
                              </Typography>
                            )}
                          </>
                        ) : (
                          <>
                            <Typography variant="body1" sx={{ color: '#388e3c', fontWeight: 'bold' }}>
                              {row.currency} {addThousandSeparator(absolutePendingAmount)}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#757575' }}>
                              You will give
                            </Typography>
                          </>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Ledger Details">
                          <Link
                            to={`/vendor/details/${row.id}`}
                            state={{
                              vendorID: row.id,
                              vendorName: row.title,
                              advanceAmount: row.advanceAmount,
                              vendorLedgerData: [row.registrationNo, row.email, row.contactNumber, row.address]
                            }}
                          >
                            <IconButton size="small">
                              <IconEye />
                            </IconButton>
                          </Link>
                        </Tooltip>
                        <Tooltip title="Preview PDF">
                          <IconButton size="small" color="secondary" onClick={() => handlePreviewVendorPDF(row)}>
                            <PictureAsPdfIcon />
                          </IconButton>
                        </Tooltip>
                        {userData.userRole !== 'Admin' && userData.userRole !== 'AgentSales' && userData.userRole === 'SuperAdmin' && (
                          <>
                            <Link to={`/vendor/edit/${row.id}`}>
                              <IconButton size="small" color="dark">
                                <IconEdit />
                              </IconButton>
                            </Link>
                            <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => deleteVendor(row.id)}>
                              <IconTrash />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={4} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredVendors.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>

      {/* PDF Preview Dialog */}
      <Dialog open={pdfPreviewOpen} onClose={handleClosePreview} maxWidth="md" fullWidth>
        <DialogTitle>{currentPdfType === 'single' ? `${currentVendor?.title} PDF Preview` : 'All Vendors PDF Preview'}</DialogTitle>
        <DialogContent sx={{ p: 3, height: '80vh' }}>
          {pdfLoading ? (
            <Typography>Loading PDF preview...</Typography>
          ) : pdfPreviewUrl ? (
            <iframe src={pdfPreviewUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Preview" />
          ) : (
            <Typography>Failed to load PDF preview.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClosePreview} color="primary" disabled={pdfLoading}>
            Cancel
          </Button>
          <Button onClick={handleDownloadPDF} variant="contained" color="secondary" disabled={pdfLoading}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default VendorsListing;

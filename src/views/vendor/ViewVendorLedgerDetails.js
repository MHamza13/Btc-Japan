import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import BackDropLoading from 'views/utilities/BackDropLoading';
import moment from 'moment';
import { fetchLedgerDetailsList, fetchVendorLedgerList, fetchEditVendorList } from 'store/vendor/vendorActions';
import { IconDownload, IconSquareRoundedPlus } from '@tabler/icons';
import { Button, Tooltip, Typography, Box, IconButton, Snackbar, Alert } from '@mui/material';
import { fetchTermPaymentsList } from 'store/car/carActions';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import imgData from './../../assets/images/in-footer-bg.png';
import headerImgData from './../../assets/images/in-header-bg.png';
import paymentImage from './../../assets/images/in-accounts-details.png';

// Styled Components
const StyledBox = styled(Box)({
  maxWidth: '100%',
  width: '100%',
  margin: '0 auto',
  padding: '20px',
});

const SearchContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  maxWidth: '95%',
  gap: '10px',
  marginTop: '20px'
});

const ActionButtonsContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  marginTop: '20px'
});

const columns = ['Model', 'Chassis No', 'Price', 'Pending Amount', 'Purchase Date', 'Details'];

function ViewVendorLedgerDetails() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const ledgerList = useSelector((state) => state.vendor.vLedgerList || []);
  const ledgerDetailList = useSelector((state) => state.customer.cLedgerDetailList || []);
  const vendorData = useSelector((state) => state.vendor.vEditList || {});
  const loading = useSelector((state) => state.vendor.loading);
  const termPaymentListMain = useSelector((state) => state.car.termPList || []);
  const carLoading = useSelector((state) => state.car.loading);
  const userData = useSelector((state) => state.user.user || {});

  const [searchTerm, setSearchTerm] = useState('');
  const [termId, setTermId] = useState(null);
  const [openDiv, setOpenDiv] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const vendorName = vendorData.title || 'Unknown Vendor';
  const vendorPhone = vendorData.contactNumber || 'N/A';
  const vendorEmail = vendorData.email || 'N/A';
  const ledgerAdvanceAmount = vendorData.advanceAmount || 0;

  const addThousandSeparator = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchVendorLedgerList(id));
      dispatch(fetchLedgerDetailsList(id));
      dispatch(fetchEditVendorList(id));
      if (termId) {
        dispatch(fetchTermPaymentsList(termId));
      }
    }
  }, [dispatch, id, termId]);

  const termPaymentList = [...termPaymentListMain].sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
  const sortedData = [...ledgerList].sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
  const filteredData = sortedData.filter((item) => item.chassisNo?.toLowerCase().includes(searchTerm.toLowerCase()));

  const getUniqueLedgerData = (data) => {
    const uniqueCarIds = Array.from(new Set(data.map((item) => item.carId)));
    return uniqueCarIds.map((id) => data.find((item) => item.carId === id));
  };

  const ledgerParentData = getUniqueLedgerData(ledgerDetailList);

  const totalAmount = filteredData.reduce((sum, i) => (sum += i.price || 0), 0);
  const totalPendingAmount = filteredData.reduce((sum, i) => (sum += i.pendingAmount || 0), 0);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const toggleDiv = (divName, carId) => {
    setOpenDiv(openDiv === divName ? null : divName);
    setTermId(carId);
  };

  const handleSMSClick = () => {
    if (vendorPhone && vendorPhone !== 'N/A') {
      window.open(`sms:${vendorPhone}`, '_blank');
    } else {
      alert('No phone number available for SMS');
    }
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = vendorPhone.replace(/\D/g, '');
    if (phoneNumber && phoneNumber !== '') {
      window.open(`https://wa.me/${phoneNumber}`, '_blank');
    } else {
      alert('No phone number available for WhatsApp');
    }
  };

  const handleEmailClick = () => {
    if (vendorEmail && vendorEmail !== 'N/A') {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(vendorEmail)}`;
      window.open(gmailUrl, '_blank');
    } else {
      alert('No email address available');
    }
  };

  const generatePDF = (isPreview = false) => {
    setPdfLoading(true);
    const fileName = `${vendorName} Ledger`;
    let totalPrice = 0;
    let pendingPrice = 0;
    const rows = [];

    ledgerParentData.forEach((row) => {
      const price = parseFloat(row.price || 0);
      const pPrice = parseFloat(row.pendingAmount || 0);
      totalPrice += price;
      pendingPrice += pPrice;

      const parentRow = [
        { content: row.model || '', fontStyle: 'bold' },
        { content: row.chassisNo || '', fontStyle: 'bold' },
        { content: addThousandSeparator(row.price || 0) + ' ' + (row.currency || ''), fontStyle: 'bold' },
        { content: addThousandSeparator(row.pendingAmount || 0) + ' ' + (row.currency || ''), fontStyle: 'bold' },
        { content: row.purchaseDate ? moment(row.purchaseDate).format('YYYY-MM-DD - hh:mm:ss A') : '', fontStyle: 'bold' },
        { content: row.details || '', fontStyle: 'bold' }
      ];
      rows.push(parentRow);

      const childRows =
        row.termAmount === null
          ? ''
          : ledgerDetailList
              .filter((childRow) => row.carId === childRow.carId)
              .map((filteredChildRow) => [
                '',
                'Payment Term',
                '',
                addThousandSeparator(filteredChildRow.termAmount || 0) + ' ' + (row.currency || ''),
                filteredChildRow.termDate ? moment(filteredChildRow.termDate).format('YYYY-MM-DD - hh:mm:ss A') : ''
              ]);
      rows.push(...childRows);
    });

    rows.push(['', '', '', '', 'Total:', addThousandSeparator(totalPrice)]);
    rows.push(['', '', '', '', 'Pending:', addThousandSeparator(pendingPrice)]);
    rows.push(['', '', '', '', 'Security Deposit:', addThousandSeparator(ledgerAdvanceAmount)]);

    const doc = new jsPDF();

    const header = () => {
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.addImage(headerImgData, 'PNG', 0, 0, doc.internal.pageSize.width, 35);
      doc.setFontSize(12);
      doc.setTextColor(232, 45, 45);
      doc.text('Invoice to:', 5, 41);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(25);
      doc.text(vendorName, 5, 50);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Phone: ${vendorPhone}`, 5, 55);
      doc.text(`Email: ${vendorEmail}`, 5, 60);
      doc.text(`Agent ID: ${userData.userName || 'N/A'}`, doc.internal.pageSize.width - 5, 65, { align: 'right' });
    };

    const footer = () => {
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.addImage(imgData, 'PNG', 0, doc.internal.pageSize.height - 20, doc.internal.pageSize.width, 20.1);
      doc.text('https://btcjapan.net', doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 2.5, { align: 'right' });
    };

    doc.autoTable({
      head: [columns],
      body: rows,
      styles: { cellPadding: { top: 2, bottom: 2, left: 2, right: 2 }, fontSize: 10 },
      headerStyles: { fillColor: [49, 103, 177], fontSize: 11 },
      margin: { top: 73, left: 5, right: 5 },
      didDrawPage: () => {
        header();
        footer();
      },
      didParseCell: (data) => {
        const rows = data.table.body;
        if (data.row.index === rows.length - 3) {
          data.cell.styles.fillColor = '#fff';
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.cellPadding = { top: 20, bottom: 4, left: 2, right: 2 };
          data.cell.styles.fontSize = 11;
        }
        if (data.row.index === rows.length - 2) {
          data.cell.styles.textColor = '#e82d2d';
          data.cell.styles.fillColor = '#fff';
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 11;
        }
        if (data.row.index === rows.length - 1) {
          data.cell.styles.fillColor = '#fff';
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 11;
        }
      }
    });

    const imageX = 5;
    const imageY = doc.autoTable.previous.finalY + 5;
    doc.addImage(paymentImage, 'PNG', imageX, imageY, 200, 50);

    if (isPreview) {
      const pdfBlob = doc.output('blob');
      setPdfPreviewUrl(URL.createObjectURL(pdfBlob));
      setPdfPreviewOpen(true);
    } else {
      doc.save(fileName + '.pdf');
    }
    setPdfLoading(false);
  };

  const handlePreviewPdf = () => {
    generatePDF(true);
  };

  const handleDownloadPdf = () => {
    generatePDF(false);
    setPdfPreviewOpen(false);
    URL.revokeObjectURL(pdfPreviewUrl);
  };

  const handleClosePreview = () => {
    setPdfPreviewOpen(false);
    setPdfPreviewUrl('');
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      {(loading || carLoading) && <BackDropLoading />}
      <StyledBox component={Paper}>
        {/* Heading */}
        <Typography
          variant="h3"
          sx={{
            margin: "30px 0px",
            fontSize: '1.5rem',
            color: '#121926',
            fontWeight: 700,
            fontFamily: "'Roboto', sans-serif",
            flex: '1 1 100%'
          }}
        >
          Vendor Ledger Details
        </Typography>
        <Typography variant="h3" sx={{ mb: 3, fontWeight: 'bold' }}>
          ({vendorName})
          {ledgerAdvanceAmount ? (
            <span style={{ color: '#21429d', fontSize: '20px', marginLeft: '15px' }}>
              Deposit: {addThousandSeparator(ledgerAdvanceAmount)}
            </span>
          ) : null}
        </Typography>

        {/* Action Buttons */}
        <ActionButtonsContainer>
          <Button variant="outlined" onClick={handleSMSClick}>
            <img src="/SMS.png" alt="SMS Icon" style={{ width: '20px', marginRight: '5px' }} />
            {vendorPhone !== 'N/A' ? 'SMS' : 'No Number'}
          </Button>
          <Button variant="outlined" onClick={handleWhatsAppClick}>
            <img src="/WHATSAPP.png" alt="WhatsApp Icon" style={{ width: '20px', marginRight: '5px' }} />
            {vendorPhone !== 'N/A' ? 'WhatsApp' : 'No Number'}
          </Button>
          <Button variant="outlined" onClick={handleEmailClick}>
            <img src="/MAIL.png" alt="Mail Icon" style={{ width: '20px', marginRight: '5px' }} />
            {vendorEmail !== 'N/A' ? 'Gmail' : 'No Email'}
          </Button>
          <Button variant="contained" color="secondary" startIcon={<IconDownload />} onClick={handlePreviewPdf} disabled={pdfLoading}>
            Download Ledger
          </Button>
        </ActionButtonsContainer>

        {/* Search Bar */}
        <SearchContainer>
          <TextField
            id="outlined-basic"
            label="Search by Chassis No"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ flex: 1, margin: '30px 0px' }}
          />
        </SearchContainer>

        {/* Totals */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
            Total: {addThousandSeparator(totalAmount)}
          </Typography>
          <Typography variant="h6" sx={{ color: '#e82d2d', fontWeight: 'medium' }}>
            Pending: {addThousandSeparator(totalPendingAmount)}
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="vendor ledger table">
            <TableHead>
              <TableRow>
                <TableCell>Model</TableCell>
                <TableCell>Chassis No</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Pending Amount</TableCell>
                <TableCell>Purchase Date</TableCell>
                <TableCell>Details</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length !== 0 ? (
                filteredData.map((row) => (
                  <>
                    <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row">
                        {row.model || ''}
                      </TableCell>
                      <TableCell>{row.chassisNo || ''}</TableCell>
                      <TableCell>
                        {addThousandSeparator(row.price || 0)} {row.currency || ''}
                      </TableCell>
                      <TableCell>
                        {addThousandSeparator(row.pendingAmount || 0)} {row.currency || ''}
                      </TableCell>
                      <TableCell>{row.purchaseDate ? moment(row.purchaseDate).format('YYYY-MM-DD - hh:mm:ss A') : 'N/A'}</TableCell>
                      <TableCell>{row.details || ''}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => toggleDiv('toggleDiv' + row.id, row.carId)}>
                            <IconSquareRoundedPlus />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    {openDiv === 'toggleDiv' + row.id && (
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0, backgroundColor: 'rgb(244, 244, 244)', width: '100%' }}
                          colSpan={7}
                        >
                          <Table sx={{ minWidth: 650 }} aria-label="term payments table">
                            <TableHead>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Cost</TableCell>
                                <TableCell>Currency</TableCell>
                                <TableCell>Location</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {termPaymentList.map((row) =>
                                row.cashOut !== null ? (
                                  <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>{row.transDate ? moment(row.transDate).format('YYYY-MM-DD - hh:mm:ss A') : 'N/A'}</TableCell>
                                    <TableCell>{addThousandSeparator(row.cashOut || 0)}</TableCell>
                                    <TableCell>{row.currency || ''}</TableCell>
                                    <TableCell>{row.location || ''}</TableCell>
                                  </TableRow>
                                ) : null
                              )}
                            </TableBody>
                          </Table>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No matching results
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PDF Preview Dialog */}
        <Dialog open={pdfPreviewOpen} onClose={handleClosePreview} maxWidth="md" fullWidth>
          <DialogTitle>{`${vendorName} Ledger Preview`}</DialogTitle>
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
            <Button onClick={handleDownloadPdf} variant="contained" color="secondary" disabled={pdfLoading}>
              Download PDF
            </Button>
          </DialogActions>
        </Dialog>
      </StyledBox>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ViewVendorLedgerDetails;

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import BackDropLoading from 'views/utilities/BackDropLoading';
import { fetchVendorLedgerList, fetchEditVendorList } from 'store/vendor/vendorActions';
import { Typography, Box, IconButton, Button, Modal } from '@mui/material';
import bgImage from '../../assets/images/header.png';
import ledgerImg from '../../assets/images/bookmark_6783743.png';
import calendarImg from '../../assets/images/calendar_6375615.png';
import moment from 'moment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import headerImgData from '../../assets/images/in-header-bg.png';
import imgData from '../../assets/images/in-footer-bg.png';
import paymentImage from '../../assets/images/in-accounts-details.png';

// Styled Components
const StyledBox = styled(Box)({
  maxWidth: '100%',
  width: '100%',
  margin: '0 auto',
  padding: 0,
  backgroundColor: '#f9f9f9',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
});

const HeaderContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(3)
}));

const HeaderImage = styled('img')({
  width: '100%',
  height: '230px',
  objectFit: 'cover'
});

const VendorName = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  color: '#fff',
  fontWeight: 'bold',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
}));

const MenuIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  color: '#fff',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  }
}));

const PriceBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '-30px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: '#fff',
  padding: theme.spacing(2, 2),
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  textAlign: 'start',
  width: '90%',
  zIndex: '9999'
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  padding: theme.spacing(2),
  borderRadius: '8px',
  boxShadow: '0 2px 15px rgba(0, 0, 0, 0.05)',
  margin: theme.spacing(0, 2, 2, 2)
}));

const StyledTextField = styled(TextField)(() => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#fff',
    '&:hover fieldset': {
      borderColor: '#388e3c'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#388e3c'
    }
  },
  '& .MuiInputLabel-root': {
    color: '#666'
  }
}));

const CurrencyButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  justifyContent: 'center',
  marginTop: theme.spacing(2)
}));

const ButtonContainer = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '20px',
  marginTop: '50px',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  padding: '0 10px',
  whiteSpace: 'nowrap',
  '&::-webkit-scrollbar': {
    height: '8px'
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#888',
    borderRadius: '4px'
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: '#555'
  }
}));

const StyledButton = styled('button')(({ theme }) => ({
  padding: '8px 15px',
  borderRadius: '20px',
  backgroundColor: '#f0f0f0',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '100px',
  '& p': {
    fontWeight: 'bold',
    margin: '5px 0px',
    fontSize: '14px'
  },
  '& img': {
    width: '65px',
    height: 'auto'
  },
  [theme.breakpoints.down('sm')]: {
    '& img': {
      width: '30px'
    },
    '& p': {
      fontSize: '10px'
    },
    minWidth: '55px'
  }
}));

const ModalBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '900px',
  backgroundColor: '#fff',
  padding: theme.spacing(4),
  borderRadius: '8px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
}));

const DateModalBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '300px',
  backgroundColor: '#fff',
  padding: theme.spacing(3),
  borderRadius: '8px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  textAlign: 'center'
}));

const SearchContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  maxWidth: '95%',
  gap: '10px'
});

const PdfPreviewBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '900px',
  backgroundColor: '#fff',
  padding: theme.spacing(4),
  borderRadius: '8px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  maxHeight: '80vh',
  overflowY: 'auto'
}));

const columns = ['Services', 'Pending', 'You Give'];

function VendorDetails() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const ledgerList = useSelector((state) => state.vendor.vLedgerList || []);
  const editVendorList = useSelector((state) => state.vendor.vEditList || {});
  const loading = useSelector((state) => state.vendor.loading);
  const userData = useSelector((state) => state.user.user || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorDetails, setVendorDetails] = useState({});
  const [openDateModal, setOpenDateModal] = useState(false);
  const [openGetModal, setOpenGetModal] = useState(false);
  const [openGiveModal, setOpenGiveModal] = useState(false);
  const [openPdfPreview, setOpenPdfPreview] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const addThousandSeparator = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchVendorLedgerList(id));
      dispatch(fetchEditVendorList(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (editVendorList && Object.keys(editVendorList).length > 0) {
      setVendorDetails({
        vendorName: editVendorList.title || 'Vendor',
        contactNumber: editVendorList.contactNumber || 'N/A',
        email: editVendorList.email || 'N/A'
      });
    }
  }, [editVendorList]);

  const sortedData = [...ledgerList].sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
  const filteredData = sortedData.filter((item) => item.chassisNo.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalPendingAmount = filteredData.reduce((sum, i) => (sum += i.pendingAmount - 0), 0);
  const totalPrice = filteredData.reduce((sum, i) => (sum += i.price - 0), 0);
  const existingCurrency = filteredData.length > 0 ? filteredData[0].currency : 'N/A';
  const latestPurchaseDate = filteredData.length > 0 ? filteredData[0].purchaseDate : 'N/A';

  const generatePDF = (isPreview = false) => {
    setPdfLoading(true);
    const doc = new jsPDF();
    const fileName = `${vendorDetails.vendorName} - Vendor Ledger Details`;

    const rows = filteredData.map((row, index) => [
      `${index + 1}. ${row.model || ''}`,
      `${addThousandSeparator(row.pendingAmount || 0)} ${row.currency || ''}`,
      `${addThousandSeparator(row.price || 0)} ${row.currency || ''}`
    ]);

    const totalRow = ['', 'Total Pending:', `${addThousandSeparator(totalPendingAmount)} ${existingCurrency}`];
    rows.push(['', '', '']);
    rows.push(totalRow);

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
      doc.text(vendorDetails.vendorName, 5, 50);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Phone: ${vendorDetails.contactNumber || 'N/A'}`, 5, 55);
      doc.text(`Email: ${vendorDetails.email || 'N/A'}`, 5, 60);
      doc.text(`Date: ${moment(latestPurchaseDate).format('YYYY-MM-DD') || 'N/A'}`, 5, 65);
      doc.text(`Agent ID: ${userData.userName}`, doc.internal.pageSize.width - 5, 70, { align: 'right' });
    };

    doc.autoTable({
      head: [columns],
      body: rows,
      styles: { cellPadding: { top: 2, bottom: 2, left: 2, right: 2 }, fontSize: 10 },
      headerStyles: { fillColor: [49, 103, 177], fontSize: 11 },
      margin: { top: 73, left: 5, right: 5 },
      didDrawPage: header,
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

    const footer = function () {
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.addImage(imgData, 'PNG', 0, doc.internal.pageSize.height - 20, doc.internal.pageSize.width, 20.1);
      doc.text('https://btcjapan.net', doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 2.5, { align: 'right' });
    };

    doc.autoTable({
      didDrawPage: footer
    });

    const imageX = 5;
    const imageY = doc.autoTable.previous.finalY + 5;
    if (imageY + 50 > doc.internal.pageSize.height - 20) {
      doc.addPage();
      header();
    }
    doc.addImage(paymentImage, 'PNG', imageX, imageY, 200, 50);

    if (isPreview) {
      const pdfBlob = doc.output('blob');
      setPdfDataUrl(URL.createObjectURL(pdfBlob));
    } else {
      doc.save(`${fileName}.pdf`);
    }
    setPdfLoading(false);
  };

  const handlePdfPreview = () => {
    generatePDF(true);
    setOpenPdfPreview(true);
  };

  const handlePdfDownload = () => {
    generatePDF(false);
    setOpenPdfPreview(false);
    URL.revokeObjectURL(pdfDataUrl);
  };

  const handleOpenDateModal = () => setOpenDateModal(true);
  const handleCloseDateModal = () => setOpenDateModal(false);
  const handleOpenGetModal = () => setOpenGetModal(true);
  const handleCloseGetModal = () => setOpenGetModal(false);
  const handleOpenGiveModal = () => setOpenGiveModal(true);
  const handleCloseGiveModal = () => setOpenGiveModal(false);

  const handleWhatsAppClick = () => {
    const phoneNumber = vendorDetails.contactNumber.replace(/\D/g, '');
    if (phoneNumber) {
      window.open(`https://wa.me/${phoneNumber}`, '_blank');
    }
  };

  const handleSMSClick = () => {
    const phoneNumber = vendorDetails.contactNumber;
    if (phoneNumber) {
      window.open(`sms:${phoneNumber}`, '_blank');
    }
  };

  const handleEmailClick = () => {
    const email = vendorDetails.email;
    if (email) {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
      window.open(gmailUrl, '_blank');
    }
  };

  return (
    <>
      {loading ? <BackDropLoading /> : null}
      <StyledBox style={{ padding: 0 }}>
        <HeaderContainer>
          <HeaderImage src={bgImage} alt="Header Background" />
          <VendorName style={{ marginTop: '75px' }} variant="h2">
            {vendorDetails.vendorName}
          </VendorName>
          <Link to={`/vendor/profile/${id}`}>
            <MenuIconButton style={{ marginTop: '75px' }}>
              <MoreVertIcon size={28} />
            </MenuIconButton>
          </Link>
          <PriceBox style={{ zIndex: '9' }}>
            <Typography variant="h5" sx={{ color: '#d32f2f', fontWeight: 'bold', fontSize: '28px' }}>
              <span>{existingCurrency}</span> {addThousandSeparator(totalPendingAmount)}
            </Typography>
            <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
              You will get
            </Typography>
          </PriceBox>
        </HeaderContainer>

        <ButtonContainer>
          <Link to={`/vendor/ledger/${id}`} style={{ textDecoration: 'none' }}>
            <StyledButton type="button">
              <img src={ledgerImg} alt="Ledger Icon" />
              <p>Ledger</p>
            </StyledButton>
          </Link>
          <StyledButton type="button" onClick={handleOpenDateModal}>
            <img src={calendarImg} alt="Set Date Icon" />
            <p>Set Date</p>
          </StyledButton>
          <StyledButton type="button" onClick={handleSMSClick}>
            <img src="/SMS.png" alt="SMS Icon" />
            <p>{vendorDetails.contactNumber !== 'N/A' ? 'SMS' : 'SMS'}</p>
          </StyledButton>
          <StyledButton type="button" onClick={handleWhatsAppClick}>
            <img src="/WHATSAPP.png" alt="WhatsApp Icon" />
            <p>{vendorDetails.contactNumber !== 'N/A' ? 'WhatsApp' : 'WhatsApp'}</p>
          </StyledButton>
          <StyledButton type="button" onClick={handleEmailClick}>
            <img src="/MAIL.png" alt="Gmail Icon" />
            <p>{vendorDetails.email !== 'N/A' ? 'Gmail' : 'Gmail'}</p>
          </StyledButton>
        </ButtonContainer>

        <ContentWrapper style={{ margin: 'auto', boxShadow: 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 2 }}>
            <SearchContainer>
              <StyledTextField
                id="outlined-basic"
                label="Search by Chassis No"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flex: 1 }}
              />
              <IconButton onClick={handlePdfPreview} sx={{ color: '#21429d' }} title="Preview PDF">
                <PictureAsPdfIcon />
              </IconButton>
            </SearchContainer>
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: '8px', mt: 4 }}>
            <Table sx={{ minWidth: 650 }} aria-label="vendor ledger table">
              <TableHead>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                      {column}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length !== 0 ? (
                  filteredData.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { backgroundColor: '#fafafa' }
                      }}
                    >
                      <TableCell component="th" scope="row" sx={{ color: '#333' }}>
                        {row.model}
                      </TableCell>
                      <TableCell sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                        {addThousandSeparator(row.pendingAmount)} {row.currency}
                      </TableCell>
                      <TableCell sx={{ color: '#388e3c', fontWeight: 'bold' }}>
                        {addThousandSeparator(row.price)} {row.currency}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ color: '#666' }}>
                      No matching results
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <CurrencyButtons sx={{ mt: 10 }}>
            <Button
              variant="contained"
              onClick={handleOpenGetModal}
              sx={{
                backgroundColor: '#d32f2f',
                color: '#fff',
                fontWeight: 'bold',
                borderRadius: '20px',
                fontSize: '17px',
                padding: '5px 40px'
              }}
            >
              You Get
            </Button>
            <Button
              variant="contained"
              onClick={handleOpenGiveModal}
              sx={{
                backgroundColor: '#388e3c',
                color: '#fff',
                fontWeight: 'bold',
                borderRadius: '20px',
                fontSize: '17px',
                padding: '5px 40px'
              }}
            >
              You Give
            </Button>
          </CurrencyButtons>
        </ContentWrapper>

        <Modal
          open={openDateModal}
          onClose={handleCloseDateModal}
          aria-labelledby="date-modal-title"
          aria-describedby="date-modal-description"
        >
          <DateModalBox>
            <Typography variant="body1" sx={{ fontSize: '18px', color: '#388e3c', fontWeight: 'bold' }}>
              {latestPurchaseDate ? moment(latestPurchaseDate).format('YYYY-MM-DD') : 'N/A'}
            </Typography>
            <Button onClick={handleCloseDateModal} sx={{ mt: 3 }} variant="outlined">
              Close
            </Button>
          </DateModalBox>
        </Modal>

        <Modal open={openGetModal} onClose={handleCloseGetModal} aria-labelledby="get-modal-title" aria-describedby="get-modal-description">
          <ModalBox>
            <Typography id="get-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
              You Get Details
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Model</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.model}</TableCell>
                      <TableCell sx={{ color: '#d32f2f', fontWeight: 'bold' }}>0</TableCell>
                      <TableCell>{moment(row.purchaseDate).format('YYYY-MM-DD')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="h6" sx={{ mt: 2, color: '#d32f2f' }}>
              Total: {existingCurrency} {addThousandSeparator(totalPendingAmount)}
            </Typography>
            <Button onClick={handleCloseGetModal} sx={{ mt: 2 }} variant="outlined">
              Close
            </Button>
          </ModalBox>
        </Modal>

        <Modal
          open={openGiveModal}
          onClose={handleCloseGiveModal}
          aria-labelledby="give-modal-title"
          aria-describedby="give-modal-description"
        >
          <ModalBox>
            <Typography id="give-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
              You Give Details
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Model</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.model}</TableCell>
                      <TableCell sx={{ color: '#388e3c', fontWeight: 'bold' }}>
                        {addThousandSeparator(row.price)} {row.currency}
                      </TableCell>
                      <TableCell>{moment(row.purchaseDate).format('YYYY-MM-DD')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="h6" sx={{ mt: 2, color: '#388e3c' }}>
              Total: {existingCurrency} {addThousandSeparator(totalPrice)}
            </Typography>
            <Button onClick={handleCloseGiveModal} sx={{ mt: 2 }} variant="outlined">
              Close
            </Button>
          </ModalBox>
        </Modal>

        <Modal
          open={openPdfPreview}
          onClose={() => setOpenPdfPreview(false)}
          aria-labelledby="pdf-preview-title"
          aria-describedby="pdf-preview-description"
        >
          <PdfPreviewBox>
            <Typography id="pdf-preview-title" variant="h6" component="h2" sx={{ mb: 2 }}>
              {vendorDetails.vendorName} Ledger PDF Preview
            </Typography>
            {pdfLoading ? (
              <Typography>Loading PDF preview...</Typography>
            ) : pdfDataUrl ? (
              <iframe src={pdfDataUrl} width="100%" height="500px" style={{ border: 'none' }} title="PDF Preview" />
            ) : (
              <Typography>Failed to load PDF preview.</Typography>
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => setOpenPdfPreview(false)} variant="outlined" disabled={pdfLoading}>
                Cancel
              </Button>
              <Button onClick={handlePdfDownload} variant="contained" color="primary" disabled={pdfLoading}>
                Download
              </Button>
            </Box>
          </PdfPreviewBox>
        </Modal>
      </StyledBox>
    </>
  );
}

export default VendorDetails;
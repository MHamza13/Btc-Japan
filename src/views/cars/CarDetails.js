import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEditCarList, fetchExpenseList } from 'store/car/carActions';
import { fetchVendorList } from 'store/vendor/vendorActions';
import { fetchStationList } from 'store/station/StationAction';
import { Box, Typography, Grid, Chip, Avatar, Button, IconButton, Tooltip } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import BackDropLoading from 'views/utilities/BackDropLoading';
import { imageUrl } from 'utils/ApiUrls';
import ShareIcon from '@mui/icons-material/Share';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon
} from 'react-share';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import headerImgData from '../../assets/images/in-header-bg.png';
import imgData from '../../assets/images/in-footer-bg.png';
import paymentImage from '../../assets/images/in-accounts-details.png';

const CarDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const car = useSelector((state) => state.car.caEditList || null);
  const expenseList = useSelector((state) => state.car.exList || []);
  const vendorDataMain = useSelector((state) => state.vendor.vlist || []);
  const stationsList = useSelector((state) => state.stations.list || []);
  const loading = useSelector((state) => state.car.loading);
  const [selectedImage, setSelectedImage] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchEditCarList(id));
      dispatch(fetchExpenseList(id));
    }
    dispatch(fetchVendorList());
    dispatch(fetchStationList());
  }, [dispatch, id]);

  if (loading || !car) {
    return <BackDropLoading />;
  }

  const carId = Number(id);
  if (car.id !== carId) {
    return (
      <Typography variant="h6">
        Car data not found for ID: {id}. Loaded ID: {car.id}
      </Typography>
    );
  }

  // Parse galleryImages into an array
  let galleryImages = [];
  if (car.galleryImages && car.galleryImages !== '') {
    try {
      galleryImages =
        typeof car.galleryImages === 'string' ? car.galleryImages.split(',') : Array.isArray(car.galleryImages) ? car.galleryImages : [];
      if (galleryImages.length > 0 && !selectedImage) {
        setSelectedImage(galleryImages[0].trim());
      }
    } catch (e) {
      console.error('Failed to parse galleryImages:', e);
      galleryImages = [];
    }
  }

  // Calculate Total Expenses
  const totalExpenses = expenseList.reduce((sum, expense) => {
    return sum + (parseFloat(expense.cost) || 0);
  }, 0);

  // Calculate Total Cost (Purchase Price + Total Expenses) and Profit/Loss
  const purchasePrice = parseFloat(car.purchasePrice) || 0;
  const salePrice = parseFloat(car.salePrice) || 0;
  const totalCost = purchasePrice + totalExpenses;
  let profit = 0;
  let loss = 0;

  if (salePrice > totalCost) {
    profit = salePrice - totalCost;
  } else if (salePrice < totalCost) {
    loss = totalCost - salePrice;
  }

  const handleImageClick = (image) => {
    setSelectedImage(image.trim());
  };

  // Get vendor name and station name from their respective lists
  const vendorName = vendorDataMain.find((v) => v.id === car.purchaseVendorId)?.title || 'N/A';
  const stationName = stationsList.find((s) => s.id === car.stationId)?.stationName || 'N/A';

  const shareUrl = `${window.location.origin}/vehicles/details/${id}`;
  const shareTitle = `Check Out This ${car.model || 'Vehicle'} on Our Website`;
  const shareMessage = `🚗 For Sale: ${car.model || 'Vehicle'}\n💰 Price: ${car.purchasePrice || 'N/A'} ${
    car.purchaseCurrency || ''
  }\n📍 Status: ${car.isAvailable ? 'Available' : 'Sold Out'}\n🔗 ${shareUrl}`;

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareMessage,
          url: shareUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
        setShareDialogOpen(true);
      }
    } else {
      setShareDialogOpen(true);
    }
  };

  const handleCloseShareDialog = () => {
    setShareDialogOpen(false);
  };

  const handleGmailShare = () => {
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(shareMessage);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  const handleInstagramShare = () => {
    const instagramUrl = `https://www.instagram.com/?url=${encodeURIComponent(shareUrl)}`;
    window.open(instagramUrl, '_blank');
    alert('Instagram does not support direct sharing via web. Please paste the URL manually into your Instagram post or story.');
  };

  const addThousandSeparator = (number) => {
    return number ? number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';
  };

  const generateCarPDF = (isPreview = false) => {
    const fileName = `${car.model || 'Vehicle'} - Details`;
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
      doc.text(car.model || 'Unknown', 5, 50);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Chassis No: ${car.chassisNo || 'N/A'}`, 5, 55);
      doc.text(`Purchase Date: ${car.purchaseDate || 'N/A'}`, 5, 60);
    };

    const footer = function () {
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.addImage(imgData, 'PNG', 0, doc.internal.pageSize.height - 20, doc.internal.pageSize.width, 20.1);
      doc.text('https://btcjapan.net', doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 2.5, { align: 'right' });
    };

    // Purchase Details
    const purchaseRows = [
      ['Purchase Price', `${addThousandSeparator(car.purchasePrice)} ${car.purchaseCurrency || ''}`],
      ['Purchase Vendor', vendorName],
      ['Purchase Currency', car.purchaseCurrency || 'N/A'],
      ['Purchase Details', car.purchaseDetails || 'N/A'],
      ['Purchase Date', car.purchaseDate || 'N/A']
    ];

    // Sales Details
    const salesRows = [
      ['Sale Price', `${addThousandSeparator(car.salePrice)} ${car.saleCurrency || ''}`],
      ['Sale Customer', car.saleCustomerId || 'N/A'],
      ['Sale Currency', car.saleCurrency || 'N/A'],
      ['Sale Details', car.saleDetails || 'N/A'],
      ['Sale Document', car.saleDocument || 'N/A'],
      ['Sale Date', car.saleDate || 'N/A'],
      ['Availability', car.isAvailable ? 'Available' : 'Sold Out']
    ];

    // Expense & Location with Total Cost, Profit/Loss
    const expenseLocationRows = [
      ['Total Expenses', `${addThousandSeparator(totalExpenses)} ${car.purchaseCurrency || 'N/A'}`],
      ['Total Cost (Purchase + Expenses)', `${addThousandSeparator(totalCost)} ${car.purchaseCurrency || 'N/A'}`],
      ['Profit', profit > 0 ? `${addThousandSeparator(profit)} ${car.saleCurrency || 'N/A'}` : 'N/A'],
      ['Loss', loss > 0 ? `${addThousandSeparator(loss)} ${car.saleCurrency || 'N/A'}` : 'N/A'],
      ['Location', car.location || 'N/A'],
      ['Station', stationName]
    ];

    // Other Details
    const otherDetailsRows = [
      ['Model', car.model || 'N/A'],
      ['Chassis No', car.chassisNo || 'N/A'],
      ['Category', car.category || 'N/A'],
      ['Body Type', car.bodyType || 'N/A'],
      ['Year of Manufacture', car.yearOfManufacture || car.manufactureYear || 'N/A'],
      ['Engine CC', car.engineCC || 'N/A'],
      ['Mileage', car.mileage || 'N/A'],
      ['Seating Capacity', car.seatingCapacity || car.seatingCapicaty || 'N/A'],
      ['Doors', car.doors || 'N/A'],
      ['Cylinders', car.cylinders || 'N/A'],
      ['Horsepower', car.horsepower || car.horespower || 'N/A'],
      ['Steering Side', car.steeringSide || 'N/A'],
      ['Drive System', car.driveSystem || 'N/A'],
      ['Transmission', car.transmission || 'N/A'],
      ['Condition', car.condition || 'N/A'],
      ['Fuel Type', car.fuelType || 'N/A'],
      ['Color', car.color || 'N/A'],
      ['Is Moved', car.isMoved !== null ? (car.isMoved ? 'Yes' : 'No') : 'N/A']
    ];

    let currentY = 73;

    doc.autoTable({
      head: [['Purchase Details', '']],
      body: purchaseRows,
      startY: currentY,
      styles: { cellPadding: 2, fontSize: 10 },
      headerStyles: { fillColor: [49, 103, 177], fontSize: 11 },
      margin: { left: 5, right: 5 },
      didDrawPage: header
    });
    currentY = doc.autoTable.previous.finalY + 10;

    doc.autoTable({
      head: [['Sales Details', '']],
      body: salesRows,
      startY: currentY,
      styles: { cellPadding: 2, fontSize: 10 },
      headerStyles: { fillColor: [49, 103, 177], fontSize: 11 },
      margin: { left: 5, right: 5 }
    });
    currentY = doc.autoTable.previous.finalY + 10;

    doc.autoTable({
      head: [['Expense & Location', '']],
      body: expenseLocationRows,
      startY: currentY,
      styles: { cellPadding: 2, fontSize: 10 },
      headerStyles: { fillColor: [49, 103, 177], fontSize: 11 },
      margin: { left: 5, right: 5 }
    });
    currentY = doc.autoTable.previous.finalY + 10;

    doc.autoTable({
      head: [['Other Details', '']],
      body: otherDetailsRows,
      startY: currentY,
      styles: { cellPadding: 2, fontSize: 10 },
      headerStyles: { fillColor: [49, 103, 177], fontSize: 11 },
      margin: { left: 5, right: 5 },
      didDrawPage: footer
    });

    const imageX = 5;
    const imageY = doc.autoTable.previous.finalY + 5;
    const imageWidth = 200;
    const imageHeight = 50;
    doc.addImage(paymentImage, 'PNG', imageX, imageY, imageWidth, imageHeight);

    if (isPreview) {
      const pdfBlob = doc.output('blob');
      setPdfPreviewUrl(URL.createObjectURL(pdfBlob));
    } else {
      doc.save(`${fileName}.pdf`);
    }
  };

  const handlePreviewPDF = () => {
    generateCarPDF(true);
    setPdfPreviewOpen(true);
  };

  const handleDownloadPDF = () => {
    generateCarPDF(false);
    setPdfPreviewOpen(false);
    URL.revokeObjectURL(pdfPreviewUrl);
  };

  return (
    <>
      <MainCard
        title={
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography
              sx={{
                margin: 0,
                fontSize: '1.5rem',
                color: '#121926',
                fontWeight: 700,
                fontFamily: "'Roboto', sans-serif",
                flex: '1 1 100%'
              }}
              variant="h5"
            >{`Vehicle Details - ${car.model || car.Model || 'Unknown'}`}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Share this car">
                <IconButton onClick={handleShareClick} color="primary">
                  <ShareIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download PDF">
                <IconButton onClick={handlePreviewPDF} color="secondary">
                  <PictureAsPdfIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        }
      >
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Purchase Data */}
            <Grid item xs={12}>
              <Typography style={{ fontSize: '30px' }} variant="h6" gutterBottom>
                Purchase Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Vender Name:</Typography>
                  <Typography variant="body1">{vendorName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Purchase Price:</Typography>
                  <Typography variant="body1">
                    {car.purchasePrice ? `${addThousandSeparator(car.purchasePrice)} ${car.purchaseCurrency || ''}` : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Purchase Date:</Typography>
                  <Typography variant="body1">{car.purchaseDate || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Purchase Currency:</Typography>
                  <Typography variant="body1">{car.purchaseCurrency || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Purchase Details:</Typography>
                  <Typography variant="body1">{car.purchaseDetails || 'N/A'}</Typography>
                </Grid>
              </Grid>

              {/* Sales Data */}
              <Typography style={{ fontSize: '30px' }} variant="h6" gutterBottom sx={{ mt: 3 }}>
                Sales Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Sale Price:</Typography>
                  <Typography variant="body1">
                    {car.salePrice ? `${addThousandSeparator(car.salePrice)} ${car.saleCurrency || ''}` : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Sale Customer:</Typography>
                  <Typography variant="body1">{car.saleCustomerId || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Sale Currency:</Typography>
                  <Typography variant="body1">{car.saleCurrency || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Sale Details:</Typography>
                  <Typography variant="body1">{car.saleDetails || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Sale Document:</Typography>
                  <Typography variant="body1">{car.saleDocument || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Sale Date:</Typography>
                  <Typography variant="body1">{car.saleDate || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Availability:</Typography>
                  <Chip label={car.isAvailable ? 'Available' : 'Sold Out'} color={car.isAvailable ? 'info' : 'error'} size="small" />
                </Grid>
              </Grid>

              {/* Expense & Location */}
              <Typography style={{ fontSize: '30px' }} variant="h6" gutterBottom sx={{ mt: 3 }}>
                Expense & Location
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Total Expenses:</Typography>
                  <Typography variant="body1">
                    {addThousandSeparator(totalExpenses)} {car.purchaseCurrency || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Total Cost (Purchase + Expenses):</Typography>
                  <Typography variant="body1">
                    {addThousandSeparator(totalCost)} {car.purchaseCurrency || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Profit:</Typography>
                  <Typography variant="body1">
                    {profit > 0 ? `${addThousandSeparator(profit)} ${car.saleCurrency || 'N/A'}` : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Loss:</Typography>
                  <Typography variant="body1">{loss > 0 ? `${addThousandSeparator(loss)} ${car.saleCurrency || 'N/A'}` : 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Location:</Typography>
                  <Typography variant="body1">{car.location || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Station:</Typography>
                  <Typography variant="body1">{stationName}</Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Gallery Images */}
            <Grid item xs={12}>
              <Typography style={{ fontSize: '30px' }} variant="h6" gutterBottom align="start">
                Gallery Images
              </Typography>
              {galleryImages.length > 0 ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Avatar
                      src={`${imageUrl}${selectedImage}`}
                      alt="Selected Image Preview"
                      variant="square"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: 400,
                        borderRadius: '8px',
                        objectFit: 'contain',
                        mx: 'auto',
                        display: 'block'
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Grid container spacing={1} justifyContent="center">
                      {galleryImages.map((image, index) => (
                        <Grid item xs={6} sm={3} key={index}>
                          <Avatar
                            src={`${imageUrl}${image.trim()}`}
                            alt={`Thumbnail ${index + 1}`}
                            variant="square"
                            sx={{
                              width: '100%',
                              height: 'auto',
                              maxWidth: 100,
                              borderRadius: '4px',
                              cursor: 'pointer',
                              border: selectedImage === image.trim() ? '2px solid #1976d2' : 'none'
                            }}
                            onClick={() => handleImageClick(image)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body2" color="textSecondary" align="center">
                  No Gallery Images Available
                </Typography>
              )}
            </Grid>

            {/* Other Details */}
            <Grid item xs={12}>
              <Typography style={{ fontSize: '30px' }} variant="h6" gutterBottom>
                Other Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Model:</Typography>
                  <Typography variant="body1">{car.model || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Chassis No:</Typography>
                  <Typography variant="body1">{car.chassisNo || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Category:</Typography>
                  <Typography variant="body1">{car.category || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Body Type:</Typography>
                  <Typography variant="body1">{car.bodyType || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Year of Manufacture:</Typography>
                  <Typography variant="body1">{car.yearOfManufacture || car.manufactureYear || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Engine CC:</Typography>
                  <Typography variant="body1">{car.engineCC || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Mileage:</Typography>
                  <Typography variant="body1">{car.mileage || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Seating Capacity:</Typography>
                  <Typography variant="body1">{car.seatingCapacity || car.seatingCapicaty || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Doors:</Typography>
                  <Typography variant="body1">{car.doors || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Cylinders:</Typography>
                  <Typography variant="body1">{car.cylinders || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Horsepower:</Typography>
                  <Typography variant="body1">{car.horsepower || car.horespower || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Steering Side:</Typography>
                  <Typography variant="body1">{car.steeringSide || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Drive System:</Typography>
                  <Typography variant="body1">{car.driveSystem || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Transmission:</Typography>
                  <Typography variant="body1">{car.transmission || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Condition:</Typography>
                  <Typography variant="body1">{car.condition || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Fuel Type:</Typography>
                  <Typography variant="body1">{car.fuelType || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Color:</Typography>
                  <Typography variant="body1">{car.color || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Is Moved:</Typography>
                  <Typography variant="body1">{car.isMoved !== null ? (car.isMoved ? 'Moved' : 'No Move') : 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Other Details:</Typography>
                  <Box
                    sx={{
                      backgroundColor: '#ffffff',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      padding: '16px',
                      width: '100%',
                      maxWidth: '100%',
                      wordWrap: 'break-word',
                      marginTop: '10px'
                    }}
                  >
                    <Typography variant="body1">{car.details || 'N/A'}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </MainCard>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={handleCloseShareDialog}>
        <DialogTitle>Share This Car</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" flexWrap="wrap" gap={2} sx={{ py: 2 }}>
            <Tooltip title="Share on Facebook">
              <FacebookShareButton url={shareUrl} quote={shareMessage}>
                <FacebookIcon size={32} round />
              </FacebookShareButton>
            </Tooltip>
            <Tooltip title="Share on Twitter">
              <TwitterShareButton url={shareUrl} title={shareMessage}>
                <TwitterIcon size={32} round />
              </TwitterShareButton>
            </Tooltip>
            <Tooltip title="Share on WhatsApp">
              <WhatsappShareButton url={shareUrl} title={shareMessage}>
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>
            </Tooltip>
            <Tooltip title="Share on LinkedIn">
              <LinkedinShareButton url={shareUrl} title={shareTitle} summary={shareMessage}>
                <LinkedinIcon size={32} round />
              </LinkedinShareButton>
            </Tooltip>
            <Tooltip title="Share via Gmail">
              <IconButton onClick={handleGmailShare} sx={{ p: 0 }}>
                <EmailIcon sx={{ fontSize: 32, color: '#D44638', borderRadius: '50%' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share on Instagram">
              <IconButton onClick={handleInstagramShare} sx={{ p: 0 }}>
                <InstagramIcon sx={{ fontSize: 32, color: '#E1306C', borderRadius: '50%' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShareDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* PDF Preview Dialog */}
      <Dialog open={pdfPreviewOpen} onClose={() => setPdfPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>PDF Preview</DialogTitle>
        <DialogContent sx={{ p: 3, height: '80vh' }}>
          {pdfPreviewUrl ? (
            <iframe src={pdfPreviewUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Preview" />
          ) : (
            <Typography>Loading PDF preview...</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPdfPreviewOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDownloadPDF} variant="contained" color="secondary">
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CarDetails;

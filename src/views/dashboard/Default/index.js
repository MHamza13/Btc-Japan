import { useEffect, useState } from 'react';
import { Grid, IconButton, Tab, TextField, Dialog, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardStatsList, fetchPendingPaymentsList, fetchPendingTermsList } from 'store/dashboard/dashboardActions';
import { fetchCustomerList } from 'store/customer/customerActions';
import { fetchVendorList } from 'store/vendor/vendorActions';
import { fetchCountryList } from 'store/country/countryActions';
import { sendEmailReminder } from 'store/email/emailActions';
import BackDropLoading from 'views/utilities/BackDropLoading';
import { Link, useNavigate } from 'react-router-dom';
import DashboardAddExpense from './DashboardAddExpense';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Box from '@mui/material/Box';
import { List, ListItem, ListItemText } from '@mui/material';
import bgImage from '../../../assets/images/header.png';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TuneIcon from '@mui/icons-material/Tune';
import MailIcon from '@mui/icons-material/Mail';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import headerImgData from '../../../assets/images/in-header-bg.png';
import imgData from '../../../assets/images/in-footer-bg.png';
import paymentImage from '../../../assets/images/in-accounts-details.png';
import Swal from 'sweetalert2';
import { fetchCarList } from 'store/car/carActions';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((state) => state.dashboard.loading);
  const emailLoading = useSelector((state) => state.email.loading);
  const pendingPaymentsList = useSelector((state) => state.dashboard.pendingPayments || []);
  const pendingTermsList = useSelector((state) => state.dashboard.pendingTerms || []);
  const customerDataMain = useSelector((state) => state.customer.clist || []);
  const vendorDataMain = useSelector((state) => state.vendor.vlist || []);
  const countryList = useSelector((state) => state.countries.list || []);
  const userData = useSelector((state) => state.user.user || {});
  const carDataMain = useSelector((state) => state.car.calist || []);

  const [dashboardExpensePopupOpen, setDashboardExpensePopupOpen] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [customersSearchTerm, setCustomersSearchTerm] = useState('');
  const [showVendorFilter, setShowVendorFilter] = useState(false);
  const [showCustomerFilter, setShowCustomerFilter] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [value, setValue] = useState('Customers');
  const [customerCurrency, setCustomerCurrency] = useState(null);
  const [vendorCurrency, setVendorCurrency] = useState(null);
  const [enrichedPendingPayments, setEnrichedPendingPayments] = useState([]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const addThousandSeparator = (number) => {
    return number?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';
  };

  useEffect(() => {
    dispatch(fetchDashboardStatsList());
    dispatch(fetchPendingPaymentsList(userData.userRole === 'SuperAdmin' || userData.userRole === 'MainAdmin' ? '' : userData.countryId));
    dispatch(fetchPendingTermsList(userData.userRole === 'SuperAdmin' || userData.userRole === 'MainAdmin' ? '' : userData.countryId));
    dispatch(fetchCountryList());
    dispatch(fetchCustomerList());
    dispatch(fetchVendorList());
    dispatch(fetchCarList());
  }, [dispatch, userData]);

  // Match car data with vendors and customers, calculate totals, and log/send reminders
  useEffect(() => {
    carDataMain.forEach((car) => {
      // Vendor logic
      const matchingVendor = vendorDataMain.find((vendor) => vendor.id === car.purchaseVendorId);
      if (matchingVendor) {
        const vendorPendingPayment = enrichedPendingPayments.find(
          (payment) => payment.id === matchingVendor.id && payment.type === 'vendor'
        );
        const vendorCars = carDataMain.filter((c) => c.purchaseVendorId === matchingVendor.id);
        const yourTotalPurchasePrice = vendorCars.reduce((sum, c) => sum + (parseFloat(c.purchasePrice) || 0), 0);

        console.log(
          `Vendor: ${matchingVendor.title}, ` +
            `Pending Purchase Amount: ${vendorPendingPayment?.pendingPurchaseAmount || 'N/A'}, ` +
            `Your Total Purchase Price: ${yourTotalPurchasePrice || 'N/A'}`
        );
      }

      // Customer logic
      const matchingCustomer = customerDataMain.find((customer) => customer.id === car.saleCustomerId);
      if (matchingCustomer) {
        const customerPendingPayment = enrichedPendingPayments.find(
          (payment) => payment.id === matchingCustomer.id && payment.type === 'customer'
        );
        const customerCars = carDataMain.filter((c) => c.saleCustomerId === matchingCustomer.id);
        const yourTotalSalePrice = customerCars.reduce((sum, c) => sum + (parseFloat(c.salePrice) || 0), 0);

        console.log(
          `Customer: ${matchingCustomer.firstName} ${matchingCustomer.lastName}, ` +
            `Pending Sale Amount: ${customerPendingPayment?.pendingSaleAmount || 'N/A'}, ` +
            `Your Total Sale Price: ${yourTotalSalePrice || 'N/A'}`
        );
      }
    });
  }, [carDataMain, vendorDataMain, customerDataMain, enrichedPendingPayments]);

  useEffect(() => {
    const enrichedPayments = pendingPaymentsList.map((payment) => {
      const matchingCustomer = customerDataMain.find((customer) => customer.id === payment.customerId || customer.id === payment.id);
      if (matchingCustomer && payment.pendingSaleAmount !== undefined && payment.pendingSaleAmount !== null) {
        const country = countryList.find((c) => c.id === payment.countryId);
        return {
          ...payment,
          id: matchingCustomer.id,
          name: `${matchingCustomer.firstName} ${matchingCustomer.lastName}`,
          email: matchingCustomer.email || 'N/A',
          phone: matchingCustomer.phoneNumber || 'N/A',
          phoneWithCountryCode: matchingCustomer.phoneNumber?.startsWith('+')
            ? matchingCustomer.phoneNumber
            : country?.phoneCode
            ? `${country.phoneCode}${matchingCustomer.phoneNumber?.replace(/\D/g, '')}`
            : matchingCustomer.phoneNumber || 'N/A',
          type: 'customer'
        };
      }

      const matchingVendor = vendorDataMain.find((vendor) => vendor.id === payment.vendorId || vendor.id === payment.id);
      if (matchingVendor && payment.pendingPurchaseAmount !== undefined && payment.pendingPurchaseAmount !== null) {
        const country = countryList.find((c) => c.id === payment.countryId);
        return {
          ...payment,
          id: matchingVendor.id,
          name: matchingVendor.title,
          email: matchingVendor.email || 'N/A',
          phone: matchingVendor.contactNumber || 'N/A',
          phoneWithCountryCode: matchingVendor.contactNumber?.startsWith('+')
            ? matchingVendor.contactNumber
            : country?.phoneCode
            ? `${country.phoneCode}${matchingVendor.contactNumber?.replace(/\D/g, '')}`
            : matchingVendor.contactNumber || 'N/A',
          type: 'vendor'
        };
      }

      return {
        ...payment,
        email: 'N/A',
        phone: 'N/A',
        phoneWithCountryCode: 'N/A',
        type: 'unknown'
      };
    });

    setEnrichedPendingPayments(enrichedPayments);
  }, [pendingPaymentsList, customerDataMain, vendorDataMain, countryList]);

  const uniqueCurrencies = [...new Set(pendingPaymentsList.map((item) => item.currency))];
  const currencyCountryMap = uniqueCurrencies.map((currency) => {
    const matchingCountry = countryList.find((country) => country.currency === currency);
    return {
      currency,
      countryName: matchingCountry ? matchingCountry.name : null,
      countryFlag: matchingCountry ? matchingCountry.flag : null
    };
  });

  const pendingSaleAmount = enrichedPendingPayments.filter((item) => {
    const matchesName = item.name?.toLowerCase().includes(customersSearchTerm.toLowerCase()) || false;
    const matchesCountry =
      userData.userRole === 'SuperAdmin' || userData.userRole === 'MainAdmin' ? true : item.countryId === userData.countryId;
    const matchesCurrency = !customerCurrency || item.currency === customerCurrency;
    return (
      item.pendingSaleAmount !== undefined &&
      item.pendingSaleAmount !== null &&
      matchesName &&
      matchesCountry &&
      matchesCurrency &&
      item.type === 'customer'
    );
  });

  const pendingPurchaseAmount = enrichedPendingPayments.filter((item) => {
    const matchesName = item.name?.toLowerCase().includes(vendorSearchTerm.toLowerCase()) || false;
    const matchesCountry =
      userData.userRole === 'SuperAdmin' || userData.userRole === 'MainAdmin' ? true : item.countryId === userData.countryId;
    const matchesCurrency = !vendorCurrency || item.currency === vendorCurrency;
    return (
      item.pendingPurchaseAmount !== undefined &&
      item.pendingPurchaseAmount !== null &&
      matchesName &&
      matchesCountry &&
      matchesCurrency &&
      item.type === 'vendor'
    );
  });

  const filteredCustomerTerms = pendingTermsList.filter((item) => {
    const matchesCountry =
      userData.userRole === 'SuperAdmin' || userData.userRole === 'MainAdmin' ? true : item.countryId === userData.countryId;
    const matchesCurrency = !customerCurrency || item.saleCurrency === customerCurrency;
    return matchesCountry && item.pendingSaleAmount !== null && matchesCurrency;
  });

  const filteredVendorTerms = pendingTermsList.filter((item) => {
    const matchesCountry =
      userData.userRole === 'SuperAdmin' || userData.userRole === 'MainAdmin' ? true : item.countryId === userData.countryId;
    const matchesCurrency = !vendorCurrency || item.purchaseCurrency === vendorCurrency;
    return matchesCountry && matchesCurrency;
  });

  const navigateToCustomerDetails = (id) => {
    navigate(`/customer/details/${id}`);
  };

  const navigateToVendorDetails = (id) => {
    navigate(`/vendor/details/${id}`);
  };

  const handelDashboardExpensePopupOpen = () => {
    setDashboardExpensePopupOpen(true);
  };

  const handleVendorSearchChange = (event) => {
    setVendorSearchTerm(event.target.value);
  };

  const handleCustomersSearchChange = (event) => {
    setCustomersSearchTerm(event.target.value);
  };

  const generateCustomersPDF = (isPreview = false) => {
    const fileName = 'Customer Pending Payments (You Will Give)';
    let totalPending = 0;
    const rows = [];

    pendingSaleAmount.forEach((customer, index) => {
      const pending = Math.abs(parseFloat(customer.pendingSaleAmount));
      totalPending += pending;

      rows.push([
        { content: `${index + 1}. ${customer.name}`, fontStyle: 'bold' },
        { content: `${addThousandSeparator(pending)} ${customer.currency}`, fontStyle: 'bold' },
        { content: customer.pendingSaleAmount < 0 ? 'You will give' : 'You will get', fontStyle: 'bold' }
      ]);
    });

    rows.push(['', '', '']);
    rows.push(['', 'Total Pending:', `${addThousandSeparator(totalPending)} ${pendingSaleAmount[0]?.currency || ''}`]);

    const doc = new jsPDF();
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
      doc.text('Customers', 5, 50);
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
      head: [['Name', 'Pending Amount', 'Status']],
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
    doc.addImage(paymentImage, 'PNG', imageX, imageY, 200, 50);

    if (isPreview) {
      const pdfBlob = doc.output('blob');
      setPreviewUrl(URL.createObjectURL(pdfBlob));
    } else {
      doc.save(`${fileName}.pdf`);
    }
  };

  const generateVendorsPDF = (isPreview = false) => {
    const fileName = 'Vendor Pending Payments (You Will Get)';
    let totalPending = 0;
    const rows = [];

    pendingPurchaseAmount.forEach((vendor, index) => {
      const absoluteAmount = Math.abs(vendor.pendingPurchaseAmount || 0);
      totalPending += absoluteAmount;

      rows.push([
        { content: `${index + 1}. ${vendor.name}`, fontStyle: 'bold' },
        { content: `${addThousandSeparator(absoluteAmount)} ${vendor.currency}`, fontStyle: 'bold' },
        { content: vendor.pendingPurchaseAmount < 0 ? 'You will get' : 'You will give', fontStyle: 'bold' }
      ]);
    });

    rows.push(['', '', '']);
    rows.push(['', 'Total Pending:', `${addThousandSeparator(totalPending)} ${pendingPurchaseAmount[0]?.currency || ''}`]);

    const doc = new jsPDF();
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
      doc.text('Vendors', 5, 50);
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
      head: [['Name', 'Pending Amount', 'Status']],
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
    doc.addImage(paymentImage, 'PNG', imageX, imageY, 200, 50);

    if (isPreview) {
      const pdfBlob = doc.output('blob');
      setPreviewUrl(URL.createObjectURL(pdfBlob));
    } else {
      doc.save(`${fileName}.pdf`);
    }
  };

  const handleCustomerPreview = () => {
    setPreviewType('Customers');
    generateCustomersPDF(true);
    setPreviewOpen(true);
  };

  const handleVendorPreview = () => {
    setPreviewType('Vendors');
    generateVendorsPDF(true);
    setPreviewOpen(true);
  };

  const handleDownload = () => {
    if (previewType === 'Customers') {
      generateCustomersPDF(false);
    } else if (previewType === 'Vendors') {
      generateVendorsPDF(false);
    }
    setPreviewOpen(false);
    URL.revokeObjectURL(previewUrl);
  };

  const sendWhatsAppReminder = (entity, type) => {
    const pendingAmount = type === 'customer' ? Math.abs(entity.pendingSaleAmount) : Math.abs(entity.pendingPurchaseAmount);
    const totalPrice =
      type === 'customer'
        ? carDataMain.filter((c) => c.saleCustomerId === entity.id).reduce((sum, c) => sum + (parseFloat(c.salePrice) || 0), 0)
        : carDataMain.filter((c) => c.purchaseVendorId === entity.id).reduce((sum, c) => sum + (parseFloat(c.purchasePrice) || 0), 0);
    const currency = entity.currency;
    const status =
      type === 'customer'
        ? entity.pendingSaleAmount < 0
          ? 'You owe us'
          : 'We owe you'
        : entity.pendingPurchaseAmount < 0
        ? 'We owe you'
        : 'You owe us';
    const message = `Hello ${
      entity.name
    },\nThis is a reminder from Admin - BTC Japan.\nYour total amount: ${currency} ${addThousandSeparator(
      totalPrice
    )}.\nPending amount: ${currency} ${addThousandSeparator(pendingAmount)}.\nStatus: ${status}.\nAgent ID: ${
      userData.userName || 'N/A'
    }\nPlease settle the amount at your earliest convenience.\nThank you!`;
    const encodedMessage = encodeURIComponent(message);
    const phone = entity.phoneWithCountryCode?.replace(/\D/g, '') || entity.phone?.replace(/\D/g, '');
    if (!phone || phone === 'N/A') {
      Swal.fire({
        icon: 'info',
        title: 'No Phone Number',
        text: `${entity.name} does not have a valid phone number with country code.`,
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleIndividualCustomerReminder = async (customer, via = 'email') => {
    const pendingAmount = Math.abs(customer.pendingSaleAmount);
    const totalSalePrice = carDataMain
      .filter((c) => c.saleCustomerId === customer.id)
      .reduce((sum, c) => sum + (parseFloat(c.salePrice) || 0), 0);
    const status = customer.pendingSaleAmount < 0 ? 'You owe us' : 'We owe you';

    if (via === 'email') {
      if (!customer.email || customer.email === 'N/A') {
        Swal.fire({
          icon: 'info',
          title: 'No Email',
          text: `${customer.name} does not have an email address.`,
          confirmButtonColor: '#3085d6'
        });
        return;
      }

      try {
        await dispatch(
          sendEmailReminder({
            email: customer.email,
            name: customer.name,
            pendingAmount: pendingAmount,
            totalAmount: totalSalePrice,
            currencySymbol: customer.currency,
            status: status
          })
        );

        Swal.fire({
          icon: 'success',
          title: 'Reminder Sent',
          text: `Email reminder has been sent to ${customer.name}`,
          timer: 2500
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to send email reminder. Please try again.',
          confirmButtonColor: '#3085d6'
        });
      }
    } else if (via === 'whatsapp') {
      sendWhatsAppReminder(customer, 'customer');
    }
  };

  const handleIndividualVendorReminder = async (vendor, via = 'email') => {
    const pendingAmount = Math.abs(vendor.pendingPurchaseAmount);
    const totalPurchasePrice = carDataMain
      .filter((c) => c.purchaseVendorId === vendor.id)
      .reduce((sum, c) => sum + (parseFloat(c.purchasePrice) || 0), 0);
    const status = vendor.pendingPurchaseAmount < 0 ? 'We owe you' : 'You owe us';

    if (via === 'email') {
      if (!vendor.email || vendor.email === 'N/A') {
        Swal.fire({
          icon: 'info',
          title: 'No Email',
          text: `${vendor.name} does not have an email address.`,
          confirmButtonColor: '#3085d6'
        });
        return;
      }

      try {
        await dispatch(
          sendEmailReminder({
            email: vendor.email,
            name: vendor.name,
            pendingAmount: pendingAmount,
            totalAmount: totalPurchasePrice,
            currencySymbol: vendor.currency,
            status: status
          })
        );

        Swal.fire({
          icon: 'success',
          title: 'Reminder Sent',
          text: `Email reminder has been sent to ${vendor.name}`,
          timer: 2500
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to send email reminder. Please try again.',
          confirmButtonColor: '#3085d6'
        });
      }
    } else if (via === 'whatsapp') {
      sendWhatsAppReminder(vendor, 'vendor');
    }
  };

  const renderFilterPopup = (type) => {
    const isCustomer = type === 'Customers';
    const selectedCurrency = isCustomer ? customerCurrency : vendorCurrency;
    const setCurrency = isCustomer ? setCustomerCurrency : setVendorCurrency;
    const setFilterVisibility = isCustomer ? setShowCustomerFilter : setShowVendorFilter;

    return (
      <Dialog open={isCustomer ? showCustomerFilter : showVendorFilter} onClose={() => setFilterVisibility(false)}>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Filter by Currency ({type})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button variant={selectedCurrency === null ? 'contained' : 'outlined'} color="primary" onClick={() => setCurrency(null)}>
              All
            </Button>
            {currencyCountryMap.map(({ currency, countryName, countryFlag }) => (
              <Button
                key={currency}
                variant={selectedCurrency === currency ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setCurrency(currency)}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                {countryFlag && <img src={countryFlag} alt={`${countryName} flag`} style={{ width: '20px', height: 'auto' }} />}
                {countryName || currency}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterVisibility(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      {loading || emailLoading ? <BackDropLoading /> : null}
      <DashboardAddExpense
        dashboardExpensePopupOpen={dashboardExpensePopupOpen}
        setDashboardExpensePopupOpen={setDashboardExpensePopupOpen}
      />

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

      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <Box sx={{ width: '100%', height: '250px', overflow: 'hidden' }}>
          <img src={bgImage} alt="" style={{ width: '100%', height: '100%' }} />
        </Box>

        <Box sx={{ width: '100%', maxWidth: '90%', margin: '-140px auto 0 auto', zIndex: 10 }}>
          <TabContext value={value}>
            <Box sx={{ bgcolor: 'transparent' }}>
              <TabList
                onChange={handleChange}
                centered
                sx={{
                  '& .MuiTab-root': {
                    color: '#ffffff',
                    fontSize: '30px',
                    padding: '20px 50px',
                    marginTop: '10px',
                    textAlign: 'center',
                    '@media (max-width: 768px)': {
                      fontSize: '18px',
                      padding: '12px 25px',
                      marginTop: '6px',
                      color: '#f0f0f0'
                    }
                  },
                  '& .MuiTab-root.Mui-selected': { color: '#ffffff' },
                  '& .MuiTabs-indicator': { backgroundColor: '#ffffff' }
                }}
              >
                <Tab label="Customers" value="Customers" />
                <Tab label="Vendors" value="Vendors" />
              </TabList>
            </Box>

            <TabPanel value="Customers">
              <Grid container>
                <Grid container item xs={12}>
                  <Grid item xs={6} style={{ margin: '0px', padding: '0px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                      <List sx={{ padding: 0, width: '100%', textAlign: 'center' }}>
                        {filteredCustomerTerms.length === 0 || !filteredCustomerTerms.some((item) => item.pendingSaleAmount < 0) ? (
                          <ListItem
                            sx={{
                              backgroundColor: '#fff',
                              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                              borderTopLeftRadius: '50px',
                              borderBottomLeftRadius: '50px',
                              padding: '5px',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginBottom: '8px'
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography className="price-list" variant="subtitle1" sx={{ color: '#757575' }}>
                                  ---
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" sx={{ color: '#757575' }}>
                                  No data
                                </Typography>
                              }
                              sx={{ textAlign: 'center' }}
                            />
                          </ListItem>
                        ) : (
                          filteredCustomerTerms.map((item, i) =>
                            item.pendingSaleAmount < 0 ? (
                              <ListItem
                                key={i}
                                sx={{
                                  backgroundColor: '#fff',
                                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                                  borderTopLeftRadius: '50px',
                                  borderBottomLeftRadius: '50px',
                                  padding: '5px',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginBottom: '8px'
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Typography className="price-list" variant="subtitle1" sx={{ color: '#388e3c', fontWeight: 'bold' }}>
                                      {item.saleCurrency} {addThousandSeparator(Math.abs(item.pendingSaleAmount))}
                                    </Typography>
                                  }
                                  secondary={
                                    <Typography variant="body2" sx={{ color: '#757575' }}>
                                      You will give
                                    </Typography>
                                  }
                                  sx={{ textAlign: 'center' }}
                                />
                              </ListItem>
                            ) : null
                          )
                        )}
                      </List>
                    </Box>
                  </Grid>

                  <Grid item xs={6} style={{ margin: '0px', padding: '0px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                      <List sx={{ padding: 0, width: '100%', textAlign: 'center' }}>
                        {filteredCustomerTerms.length === 0 || !filteredCustomerTerms.some((item) => item.pendingSaleAmount > 0) ? (
                          <ListItem
                            sx={{
                              backgroundColor: '#fff',
                              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                              borderTopRightRadius: '50px',
                              borderBottomRightRadius: '50px',
                              padding: '5px',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginBottom: '8px'
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography className="price-list" variant="subtitle1" sx={{ color: '#757575' }}>
                                  ---
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" sx={{ color: '#757575' }}>
                                  No data
                                </Typography>
                              }
                              sx={{ textAlign: 'center' }}
                            />
                          </ListItem>
                        ) : (
                          filteredCustomerTerms.map((item, i) =>
                            item.pendingSaleAmount > 0 ? (
                              <ListItem
                                key={i}
                                sx={{
                                  backgroundColor: '#fff',
                                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                                  borderTopRightRadius: '50px',
                                  borderBottomRightRadius: '50px',
                                  padding: '5px',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginBottom: '8px'
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Typography className="price-list" variant="subtitle1" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                                      {item.saleCurrency} {addThousandSeparator(item.pendingSaleAmount)}
                                    </Typography>
                                  }
                                  secondary={
                                    <Typography variant="body2" sx={{ color: '#757575' }}>
                                      You will get
                                    </Typography>
                                  }
                                  sx={{ textAlign: 'center' }}
                                />
                              </ListItem>
                            ) : null
                          )
                        )}
                      </List>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value="Vendors">
              <Grid container>
                <Grid container item xs={12}>
                  <Grid item xs={6} style={{ margin: '0px', padding: '0px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                      <List sx={{ padding: 0, width: '100%', textAlign: 'center' }}>
                        {filteredVendorTerms.length === 0 || !filteredVendorTerms.some((item) => item.pendingPurchaseAmount >= 0) ? (
                          <ListItem
                            sx={{
                              backgroundColor: '#fff',
                              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                              borderTopLeftRadius: '50px',
                              borderBottomLeftRadius: '50px',
                              padding: '5px',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography className="price-list" variant="subtitle1" sx={{ color: '#757575' }}>
                                  ---
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" sx={{ color: '#757575' }}>
                                  No data
                                </Typography>
                              }
                              sx={{ textAlign: 'center' }}
                            />
                          </ListItem>
                        ) : (
                          filteredVendorTerms.map((item, i) =>
                            item.pendingPurchaseAmount >= 0 ? (
                              <ListItem
                                key={i}
                                sx={{
                                  backgroundColor: '#fff',
                                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                                  borderTopLeftRadius: '50px',
                                  borderBottomLeftRadius: '50px',
                                  padding: '5px',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginBottom: '8px'
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Typography className="price-list" variant="subtitle1" sx={{ color: '#388e3c', fontWeight: 'bold' }}>
                                      {item.purchaseCurrency} {addThousandSeparator(item.pendingPurchaseAmount)}
                                    </Typography>
                                  }
                                  secondary={
                                    <Typography variant="body2" sx={{ color: '#757575' }}>
                                      You will give
                                    </Typography>
                                  }
                                  sx={{ textAlign: 'center' }}
                                />
                              </ListItem>
                            ) : null
                          )
                        )}
                      </List>
                    </Box>
                  </Grid>

                  <Grid item xs={6} style={{ margin: '0px', padding: '0px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                      <List sx={{ padding: '0', width: '100%', textAlign: 'center' }}>
                        {filteredVendorTerms.length === 0 || !filteredVendorTerms.some((item) => item.pendingPurchaseAmount < 0) ? (
                          <ListItem
                            sx={{
                              backgroundColor: '#fff',
                              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                              borderTopRightRadius: '50px',
                              borderBottomRightRadius: '50px',
                              padding: '5px',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography className="price-list" variant="subtitle1" sx={{ color: '#757575' }}>
                                  ---
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" sx={{ color: '#757575' }}>
                                  No data
                                </Typography>
                              }
                              sx={{ textAlign: 'center' }}
                            />
                          </ListItem>
                        ) : (
                          filteredVendorTerms.map((item, i) =>
                            item.pendingPurchaseAmount < 0 ? (
                              <ListItem
                                key={i}
                                sx={{
                                  backgroundColor: '#fff',
                                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                                  borderTopRightRadius: '50px',
                                  borderBottomRightRadius: '50px',
                                  padding: '5px',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginBottom: '8px'
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Typography className="price-list" variant="subtitle1" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                                      {item.purchaseCurrency} {addThousandSeparator(Math.abs(item.pendingPurchaseAmount))}
                                    </Typography>
                                  }
                                  secondary={
                                    <Typography variant="body2" sx={{ color: '#757575' }}>
                                      You will get
                                    </Typography>
                                  }
                                  sx={{ textAlign: 'center' }}
                                />
                              </ListItem>
                            ) : null
                          )
                        )}
                      </List>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </TabPanel>
          </TabContext>
        </Box>
      </Box>

      <Grid
        container
        item
        spacing={2}
        className="dashboard-menu-main"
        style={{ padding: '0px 0px', backgroundColor: '#f5f5f5', marginTop: '-70px' }}
      >
        <Grid container item spacing={2}>
          <Grid item xs={12} className="dashboard-menu-mainss">
            <div className="dashboard-menu">
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={3} sm={4} md={2}>
                  <Link to="/vehicles/listing" className="menu-item">
                    <img src="/ALL CARS.png" alt="All Cars" className="menu-icon" />
                    <p>All Vehicles</p>
                  </Link>
                </Grid>
                <Grid item xs={3} sm={4} md={2} sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Link to="/customer/listing" className="menu-item">
                    <img src="/CUSTOMER.png" alt="CUSTOMER" className="menu-icon" />
                    <p>Customers</p>
                  </Link>
                </Grid>
                <Grid item xs={3} sm={4} md={2} sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Link to="/vendor/listing" className="menu-item">
                    <img src="/VENDOR.png" alt="VENDOR" className="menu-icon" />
                    <p>Vendors</p>
                  </Link>
                </Grid>
                <Grid item xs={3} sm={4} md={2}>
                  <Link to="/staff/listing" className="menu-item">
                    <img src="/STAFF.png" alt="STAFF" className="menu-icon" />
                    <p>Staff</p>
                  </Link>
                </Grid>
                <Grid item xs={3} sm={4} md={2}>
                  <Link to="#" onClick={() => handelDashboardExpensePopupOpen()} className="menu-item">
                    <img src="/expense.png" alt="expense" className="menu-icon" />
                    <p>Expense</p>
                  </Link>
                </Grid>
                <Grid item xs={3} sm={4} md={2}>
                  <Link to="/bill-book" className="menu-item">
                    <img src="/BILL BOOK.png" alt="BILL BOOK" className="menu-icon" />
                    <p>Bill Book</p>
                  </Link>
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ width: '100%', margin: '20px auto', padding: '0px 40px 60px 10px' }}>
        {value === 'Customers' && (
          <Grid item xs={12}>
            <div className="d-stats-box-main d-stats-give-box-main">
              <div className="d-stats-box-header">
                <TextField
                  id="customer-search"
                  label="Search Customers"
                  variant="outlined"
                  value={customersSearchTerm}
                  onChange={handleCustomersSearchChange}
                  size="small"
                  sx={{ maxWidth: 400 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconButton color="primary" onClick={() => setShowCustomerFilter(true)}>
                    <TuneIcon />
                  </IconButton>
                  <IconButton color="secondary" onClick={handleCustomerPreview}>
                    <PictureAsPdfIcon />
                  </IconButton>
                </div>
              </div>
              {renderFilterPopup('Customers')}
              <div className="d-stats-box-body">
                <ul>
                  {pendingSaleAmount.length > 0 ? (
                    pendingSaleAmount.map((customer) => (
                      <li
                        key={customer.id}
                        onClick={() => navigateToCustomerDetails(customer.id)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      >
                        <div>
                          <h4>{customer.name || 'Unknown Customer'}</h4>
                          <p>{customer.pendingSaleAmount < 0 ? 'You will give' : 'You will get'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <span style={{ color: customer.pendingSaleAmount < 0 ? '#d33140' : '#388e3c' }}>
                            {customer.currency} {addThousandSeparator(Math.abs(customer.pendingSaleAmount))}
                          </span>
                          <IconButton
                            color="info"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIndividualCustomerReminder(customer, 'email');
                            }}
                            disabled={emailLoading}
                            title="Send Email Reminder"
                            size="small"
                          >
                            <MailIcon />
                          </IconButton>
                          <IconButton
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIndividualCustomerReminder(customer, 'whatsapp');
                            }}
                            title="Send WhatsApp Reminder"
                            size="small"
                          >
                            <WhatsAppIcon />
                          </IconButton>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li>
                      <h4>No customers with pending payments found</h4>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </Grid>
        )}

        {value === 'Vendors' && (
          <Grid item xs={12}>
            <div className="d-stats-box-main d-stats-get-box-main">
              <div className="d-stats-box-header">
                <TextField
                  id="vendor-search"
                  label="Search Vendors"
                  variant="outlined"
                  value={vendorSearchTerm}
                  onChange={handleVendorSearchChange}
                  size="small"
                  sx={{ maxWidth: 400 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconButton color="primary" onClick={() => setShowVendorFilter(true)}>
                    <TuneIcon />
                  </IconButton>
                  <IconButton color="secondary" onClick={handleVendorPreview}>
                    <PictureAsPdfIcon />
                  </IconButton>
                </div>
              </div>
              {renderFilterPopup('Vendors')}
              <div className="d-stats-box-body">
                <ul>
                  {pendingPurchaseAmount.length > 0 ? (
                    pendingPurchaseAmount.map((vendor) => (
                      <li
                        key={vendor.id}
                        onClick={() => navigateToVendorDetails(vendor.id)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      >
                        <div>
                          <h4>{vendor.name || 'Unknown Vendor'}</h4>
                          <p>{vendor.pendingPurchaseAmount < 0 ? 'You will get' : 'You will give'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <span style={{ color: vendor.pendingPurchaseAmount < 0 ? '#388e3c' : '#d33140' }}>
                            {vendor.currency} {addThousandSeparator(Math.abs(vendor.pendingPurchaseAmount))}
                          </span>
                          <IconButton
                            color="info"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIndividualVendorReminder(vendor, 'email');
                            }}
                            disabled={emailLoading}
                            title="Send Email Reminder"
                            size="small"
                          >
                            <MailIcon />
                          </IconButton>
                          <IconButton
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIndividualVendorReminder(vendor, 'whatsapp');
                            }}
                            title="Send WhatsApp Reminder"
                            size="small"
                          >
                            <WhatsAppIcon />
                          </IconButton>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li>
                      <h4>No vendors with pending payments found</h4>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default Dashboard;

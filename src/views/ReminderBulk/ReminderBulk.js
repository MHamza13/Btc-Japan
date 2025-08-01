import { useEffect, useState } from 'react';
import { Grid, IconButton, TextField, Dialog, DialogContent, DialogActions, Button, Typography, Box, Tabs, Tab } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPendingPaymentsList, fetchPendingTermsList } from 'store/dashboard/dashboardActions';
import { fetchCustomerList } from 'store/customer/customerActions';
import { fetchVendorList } from 'store/vendor/vendorActions';
import { fetchCountryList } from 'store/country/countryActions';
import { sendEmailReminder } from 'store/email/emailActions';
import BackDropLoading from 'views/utilities/BackDropLoading';
import MailIcon from '@mui/icons-material/Mail';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import headerImgData from '../../assets/images/in-header-bg.png';
import imgData from '../../assets/images/in-footer-bg.png';
import paymentImage from '../../assets/images/in-accounts-details.png';
import Swal from 'sweetalert2';
import { fetchCarList } from 'store/car/carActions';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TuneIcon from '@mui/icons-material/Tune';

const ReminderBulk = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.dashboard.loading);
  const emailLoading = useSelector((state) => state.email.loading);
  const pendingPaymentsList = useSelector((state) => state.dashboard.pendingPayments || []);
  const customerDataMain = useSelector((state) => state.customer.clist || []);
  const vendorDataMain = useSelector((state) => state.vendor.vlist || []);
  const countryList = useSelector((state) => state.countries.list || []);
  const userData = useSelector((state) => state.user.user || {});
  const carDataMain = useSelector((state) => state.car.calist || []);

  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [customersSearchTerm, setCustomersSearchTerm] = useState('');
  const [showVendorFilter, setShowVendorFilter] = useState(false);
  const [showCustomerFilter, setShowCustomerFilter] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [customerCurrency, setCustomerCurrency] = useState(null);
  const [vendorCurrency, setVendorCurrency] = useState(null);
  const [enrichedPendingPayments, setEnrichedPendingPayments] = useState([]);
  const [pendingSaleAmount, setPendingSaleAmount] = useState([]);
  const [pendingPurchaseAmount, setPendingPurchaseAmount] = useState([]);
  const [activeTab, setActiveTab] = useState(0); // State for active tab (0 = Customers, 1 = Vendors)

  const addThousandSeparator = (number) => {
    return number?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';
  };

  useEffect(() => {
    dispatch(fetchPendingPaymentsList(userData.userRole === 'SuperAdmin' || userData.userRole === 'MainAdmin' ? '' : userData.countryId));
    dispatch(fetchPendingTermsList(userData.userRole === 'SuperAdmin' || userData.userRole === 'MainAdmin' ? '' : userData.countryId));
    dispatch(fetchCountryList());
    dispatch(fetchCustomerList());
    dispatch(fetchVendorList());
    dispatch(fetchCarList());
  }, [dispatch, userData]);

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

  useEffect(() => {
    const filteredPendingSaleAmount = enrichedPendingPayments.filter((item) => {
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

    const filteredPendingPurchaseAmount = enrichedPendingPayments.filter((item) => {
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

    setPendingSaleAmount(filteredPendingSaleAmount);
    setPendingPurchaseAmount(filteredPendingPurchaseAmount);
  }, [enrichedPendingPayments, customersSearchTerm, vendorSearchTerm, customerCurrency, vendorCurrency, userData]);

  const uniqueCurrencies = [...new Set(pendingPaymentsList.map((item) => item.currency))];
  const currencyCountryMap = uniqueCurrencies.map((currency) => {
    const matchingCountry = countryList.find((country) => country.currency === currency);
    return {
      currency,
      countryName: matchingCountry ? matchingCountry.name : null,
      countryFlag: matchingCountry ? matchingCountry.flag : null
    };
  });

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

  const handleBulkCustomerReminder = async (via = 'email') => {
    const validCustomers = pendingSaleAmount.filter((customer) =>
      via === 'email'
        ? customer.email && customer.email !== 'N/A'
        : customer.phoneWithCountryCode && customer.phoneWithCountryCode !== 'N/A'
    );

    if (validCustomers.length === 0) {
      Swal.fire({
        icon: 'info',
        title: `No Valid ${via === 'email' ? 'Emails' : 'Phone Numbers'}`,
        text: `No customers have valid ${via === 'email' ? 'email addresses' : 'phone numbers'} for sending reminders.`,
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (via === 'email') {
      try {
        await Promise.all(
          validCustomers.map((customer) =>
            dispatch(
              sendEmailReminder({
                email: customer.email,
                name: customer.name,
                pendingAmount: Math.abs(customer.pendingSaleAmount),
                totalAmount: carDataMain
                  .filter((c) => c.saleCustomerId === customer.id)
                  .reduce((sum, c) => sum + (parseFloat(c.salePrice) || 0), 0),
                currencySymbol: customer.currency,
                status: customer.pendingSaleAmount < 0 ? 'You owe us' : 'We owe you'
              })
            )
          )
        );
        Swal.fire({
          icon: 'success',
          title: 'Bulk Reminders Sent',
          text: `Email reminders have been sent to ${validCustomers.length} customers.`,
          timer: 2500
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to send bulk email reminders. Please try again.',
          confirmButtonColor: '#3085d6'
        });
      }
    } else if (via === 'whatsapp') {
      validCustomers.forEach((customer) => sendWhatsAppReminder(customer, 'customer'));
      Swal.fire({
        icon: 'success',
        title: 'Bulk Reminders Initiated',
        text: `WhatsApp reminders have been initiated for ${validCustomers.length} customers.`,
        timer: 2500
      });
    }
  };

  const handleBulkVendorReminder = async (via = 'email') => {
    const validVendors = pendingPurchaseAmount.filter((vendor) =>
      via === 'email' ? vendor.email && vendor.email !== 'N/A' : vendor.phoneWithCountryCode && vendor.phoneWithCountryCode !== 'N/A'
    );

    if (validVendors.length === 0) {
      Swal.fire({
        icon: 'info',
        title: `No Valid ${via === 'email' ? 'Emails' : 'Phone Numbers'}`,
        text: `No vendors have valid ${via === 'email' ? 'email addresses' : 'phone numbers'} for sending reminders.`,
        confirmButtonColor: '# W3085d6'
      });
      return;
    }

    if (via === 'email') {
      try {
        await Promise.all(
          validVendors.map((vendor) =>
            dispatch(
              sendEmailReminder({
                email: vendor.email,
                name: vendor.name,
                pendingAmount: Math.abs(vendor.pendingPurchaseAmount),
                totalAmount: carDataMain
                  .filter((c) => c.purchaseVendorId === vendor.id)
                  .reduce((sum, c) => sum + (parseFloat(c.purchasePrice) || 0), 0),
                currencySymbol: vendor.currency,
                status: vendor.pendingPurchaseAmount < 0 ? 'We owe you' : 'You owe us'
              })
            )
          )
        );
        Swal.fire({
          icon: 'success',
          title: 'Bulk Reminders Sent',
          text: `Email reminders have been sent to ${validVendors.length} vendors.`,
          timer: 2500
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to send bulk email reminders. Please try again.',
          confirmButtonColor: '#3085d6'
        });
      }
    } else if (via === 'whatsapp') {
      validVendors.forEach((vendor) => sendWhatsAppReminder(vendor, 'vendor'));
      Swal.fire({
        icon: 'success',
        title: 'Bulk Reminders Initiated',
        text: `WhatsApp reminders have been initiated for ${validVendors.length} vendors.`,
        timer: 2500
      });
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      {(loading || emailLoading) && <BackDropLoading />}
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

      <Grid container spacing={3} sx={{ width: '100%', margin: '20px auto'}}>
        <Grid item xs={12}>
          <Typography
            variant="h4"
            sx={{
              margin: 0,
              fontSize: '1.5rem',
              color: '#121926',
              fontWeight: 700,
              fontFamily: "'Roboto', sans-serif",
              flex: '1 1 100%'
            }}
          >
            Bulk Reminders
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ mb: 3, '& .MuiTab-root': { fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'none' } }}
          >
            <Tab label="Customers" />
            <Tab label="Vendors" />
          </Tabs>

          {/* Customers Tab */}
          {activeTab === 0 && (
            <Box
              sx={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                padding: '20px',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: '0 6px 25px rgba(0, 0, 0, 0.1)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <TextField
                  id="customer-search"
                  label="Search Customers"
                  variant="outlined"
                  value={customersSearchTerm}
                  onChange={handleCustomersSearchChange}
                  size="small"
                  sx={{ width: '300px', backgroundColor: '#fff', borderRadius: '8px' }}
                />
                <Box sx={{ display: 'flex', gap: '10px' }}>
                  <Button
                    variant="contained"
                    color="info"
                    startIcon={<MailIcon />}
                    onClick={() => handleBulkCustomerReminder('email')}
                    disabled={emailLoading}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                  >
                    Bulk Email
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<WhatsAppIcon />}
                    onClick={() => handleBulkCustomerReminder('whatsapp')}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                  >
                    Bulk WhatsApp
                  </Button>
                  <IconButton color="primary" onClick={() => setShowCustomerFilter(true)} >
                    <TuneIcon />
                  </IconButton>
                  <IconButton color="secondary" onClick={handleCustomerPreview} >
                    <PictureAsPdfIcon />
                  </IconButton>
                </Box>
              </Box>
              {renderFilterPopup('Customers')}
              <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                {pendingSaleAmount.length > 0 ? (
                  pendingSaleAmount.map((customer) => (
                    <Box
                      key={customer.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        mb: 1,
                        bgcolor: '#fafafa',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: '#f1f8e9' }
                      }}
                    >
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'medium', color: '#1976d2' }}>
                          {customer.name || 'Unknown Customer'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: customer.pendingSaleAmount < 0 ? '#d32f2f' : '#388e3c' }}>
                          {customer.pendingSaleAmount < 0 ? 'You will give' : 'You will get'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Typography variant="h6" sx={{ color: customer.pendingSaleAmount < 0 ? '#d32f2f' : '#388e3c', fontWeight: 'bold' }}>
                          {customer.currency} {addThousandSeparator(Math.abs(customer.pendingSaleAmount))}
                        </Typography>
                        <IconButton
                          color="info"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleIndividualCustomerReminder(customer, 'email');
                          }}
                          disabled={emailLoading}
                          title="Send Email Reminder"
                          sx={{'&:hover': { bgcolor: '#bbdefb' } }}
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
                          sx={{  '&:hover': { bgcolor: '#c8e6c9' } }}
                        >
                          <WhatsAppIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ p: 2, color: '#757575', textAlign: 'center' }}>No customers with pending payments found</Typography>
                )}
              </Box>
            </Box>
          )}

          {/* Vendors Tab */}
          {activeTab === 1 && (
            <Box
              sx={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                padding: '20px',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: '0 6px 25px rgba(0, 0, 0, 0.1)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <TextField
                  id="vendor-search"
                  label="Search Vendors"
                  variant="outlined"
                  value={vendorSearchTerm}
                  onChange={handleVendorSearchChange}
                  size="small"
                  sx={{ width: '300px', backgroundColor: '#fff', borderRadius: '8px' }}
                />
                <Box sx={{ display: 'flex', gap: '10px' }}>
                  <Button
                    variant="contained"
                    color="info"
                    startIcon={<MailIcon />}
                    onClick={() => handleBulkVendorReminder('email')}
                    disabled={emailLoading}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                  >
                    Bulk Email
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<WhatsAppIcon />}
                    onClick={() => handleBulkVendorReminder('whatsapp')}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                  >
                    Bulk WhatsApp
                  </Button>
                  <IconButton color="primary" onClick={() => setShowVendorFilter(true)} >
                    <TuneIcon />
                  </IconButton>
                  <IconButton color="secondary" onClick={handleVendorPreview} >
                    <PictureAsPdfIcon />
                  </IconButton>
                </Box>
              </Box>
              {renderFilterPopup('Vendors')}
              <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                {pendingPurchaseAmount.length > 0 ? (
                  pendingPurchaseAmount.map((vendor) => (
                    <Box
                      key={vendor.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        mb: 1,
                        bgcolor: '#fafafa',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: '#f1f8e9' }
                      }}
                    >
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'medium', color: '#1976d2' }}>
                          {vendor.name || 'Unknown Vendor'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: vendor.pendingPurchaseAmount < 0 ? '#388e3c' : '#d32f2f' }}>
                          {vendor.pendingPurchaseAmount < 0 ? 'You will get' : 'You will give'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Typography
                          variant="h6"
                          sx={{ color: vendor.pendingPurchaseAmount < 0 ? '#388e3c' : '#d32f2f', fontWeight: 'bold' }}
                        >
                          {vendor.currency} {addThousandSeparator(Math.abs(vendor.pendingPurchaseAmount))}
                        </Typography>
                        <IconButton
                          color="info"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleIndividualVendorReminder(vendor, 'email');
                          }}
                          disabled={emailLoading}
                          title="Send Email Reminder"
                          sx={{  '&:hover': { bgcolor: '#bbdefb' } }}
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
                          sx={{  '&:hover': { bgcolor: '#c8e6c9' } }}
                        >
                          <WhatsAppIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ p: 2, color: '#757575', textAlign: 'center' }}>No vendors with pending payments found</Typography>
                )}
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default ReminderBulk;

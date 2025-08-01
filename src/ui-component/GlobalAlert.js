import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPendingPaymentsList } from 'store/dashboard/dashboardActions';
import { Modal, Box, Typography, List, ListItem, ListItemText, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Swal from 'sweetalert2';

const GlobalAlert = () => {
  const dispatch = useDispatch();
  const pendingPayments = useSelector((state) => state.dashboard.pendingPayments || []);
  const userData = useSelector((state) => state.auth?.userData || { userRole: '', countryId: '' });
  const [activeAlerts, setActiveAlerts] = useState({ customers: [], vendors: [] });
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [isShowingNotification, setIsShowingNotification] = useState(false);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [openVendorModal, setOpenVendorModal] = useState(false);

  console.log(activeAlerts)

  const currentDate = new Date('2025-03-29'); 

  const addThousandSeparator = (number) => {
    return number?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';
  };

  const calculateDaysPassed = (dueDate) => {
    const due = new Date(dueDate);
    const diffTime = currentDate - due;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays + 1 : 1; 
  };

  const calculateTotals = (payments, type) => {
    return payments.reduce((total, p) => {
      const amount = type === 'customer' ? p.pendingSaleAmount : (p.pendingPurchaseAmount || p.pendingSaleAmount);
      return total + (amount > 0 ? amount : 0);
    }, 0);
  };

  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission !== 'granted') {
          Swal.fire({
            icon: 'warning',
            title: 'Notifications Blocked',
            text: 'Please enable notifications in your browser settings to receive alerts.',
            toast: true,
            position: 'top-end',
          });
        }
      });
    }

    if (pendingPayments.length > 0) {
      triggerNotifications();
    }
  }, [pendingPayments]);

  useEffect(() => {
    if (!userData.userRole) {
      console.log('userData not available yet, skipping fetch');
      return;
    }
    const countryId = userData.userRole === 'SuperAdmin' || userData.userRole === 'MainAdmin' ? '' : userData.countryId;
    dispatch(fetchPendingPaymentsList(countryId));
  }, [dispatch, userData]);

  const triggerNotifications = () => {
    if (pendingPayments.length > 0) {
      setNotificationQueue([
        ...pendingPayments
          .filter((p) => p.pendingSaleAmount > 0)
          .map((p) => ({ type: 'customer', data: p })),
        ...pendingPayments
          .filter((p) => p.pendingPurchaseAmount > 0)
          .map((p) => ({ type: 'vendor', data: p })),
      ]);
    }
  };

  useEffect(() => {
    if (notificationQueue.length > 0 && !isShowingNotification) {
      const nextNotification = notificationQueue[0];
      setNotificationQueue((prev) => prev.slice(1));
      setIsShowingNotification(true);

      const daysPassed = calculateDaysPassed(nextNotification.data.dueDate);

      if (Notification.permission === 'granted') {
        const notification = new Notification(
          nextNotification.type === 'customer' ? 'Customer Reminder Alert' : 'Vendor Payment Alert',
          {
            body:
              nextNotification.type === 'customer'
                ? `Send reminder to ${nextNotification.data.name} for ${nextNotification.data.currency} ${addThousandSeparator(
                    Math.abs(nextNotification.data.pendingSaleAmount)
                  )} (${daysPassed} days passed)`
                : `Pay ${nextNotification.data.name} ${nextNotification.data.currency} ${addThousandSeparator(
                    Math.abs(nextNotification.data.pendingPurchaseAmount)
                  )} (${daysPassed} days passed)`,
            icon: nextNotification.type === 'customer' ? '/path/to/customer-icon.png' : '/path/to/vendor-icon.png',
            requireInteraction: true,
          }
        );

        notification.onclose = () => {
          setActiveAlerts((prev) => ({
            ...prev,
            [nextNotification.type === 'customer' ? 'customers' : 'vendors']: [
              ...prev[nextNotification.type === 'customer' ? 'customers' : 'vendors'],
              { id: nextNotification.data.id },
            ],
          }));
          setIsShowingNotification(false);
        };

        notification.onerror = () => {
          setIsShowingNotification(false);
        };
      } else {
        Swal.fire({
          icon: 'info',
          title: nextNotification.type === 'customer' ? 'Customer Reminder' : 'Vendor Payment',
          text:
            nextNotification.type === 'customer'
              ? `Send reminder to ${nextNotification.data.name} for ${nextNotification.data.currency} ${addThousandSeparator(
                  Math.abs(nextNotification.data.pendingSaleAmount)
                )} (${daysPassed} days passed)`
              : `Pay ${nextNotification.data.name} ${nextNotification.data.currency} ${addThousandSeparator(
                  Math.abs(nextNotification.data.pendingPurchaseAmount)
                )} (${daysPassed} days passed)`,
          toast: true,
          position: 'top-end',
          timer: 5000,
          showConfirmButton: false,
        }).then(() => {
          setActiveAlerts((prev) => ({
            ...prev,
            [nextNotification.type === 'customer' ? 'customers' : 'vendors']: [
              ...prev[nextNotification.type === 'customer' ? 'customers' : 'vendors'],
              { id: nextNotification.data.id },
            ],
          }));
          setIsShowingNotification(false);
        });
      }
    }
  }, [notificationQueue, isShowingNotification]);

  useEffect(() => {
    if (pendingPayments.length > 0 && notificationQueue.length === 0 && !isShowingNotification) {
      const hasCustomerPaymentsPast10Days = pendingPayments.some(
        (p) => p.pendingSaleAmount > 0 && calculateDaysPassed(p.dueDate) >= 10
      );
      const hasVendorPaymentsPast10Days = pendingPayments.some(
        (p) => (p.pendingPurchaseAmount > 0 || p.pendingSaleAmount < 0) && calculateDaysPassed(p.dueDate) >= 10
      );

      if (hasCustomerPaymentsPast10Days) {
        setOpenCustomerModal(true);
      } else if (hasVendorPaymentsPast10Days) {
        setOpenVendorModal(true);
      }
    }
  }, [pendingPayments, notificationQueue, isShowingNotification]);

  const handleCloseCustomerModal = () => {
    setOpenCustomerModal(false);
    const hasVendorPaymentsPast10Days = pendingPayments.some(
      (p) => (p.pendingPurchaseAmount > 0 || p.pendingSaleAmount < 0) && calculateDaysPassed(p.dueDate) >= 10
    );
    if (hasVendorPaymentsPast10Days) {
      setOpenVendorModal(true);
    }
  };

  const handleCloseVendorModal = () => {
    setOpenVendorModal(false);
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: '#ffffff',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    p: 4,
    borderRadius: '12px',
    maxHeight: '80vh',
    overflowY: 'auto',
    border: '1px solid #e0e0e0',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2,
    borderBottom: '1px solid #e0e0e0',
    pb: 1,
  };

  const listItemStyle = {
    bgcolor: '#f9f9f9',
    borderRadius: '8px',
    mb: 1,
    p: 1,
    '&:hover': { bgcolor: '#f0f0f0' },
  };

  const customersToReceive = pendingPayments.filter(
    (p) => p.pendingSaleAmount > 0 && calculateDaysPassed(p.dueDate) >= 10
  );
  const vendorsToPay = pendingPayments.filter(
    (p) => (p.pendingPurchaseAmount > 0 || p.pendingSaleAmount < 0) && calculateDaysPassed(p.dueDate) >= 10
  );
  const totalToReceive = calculateTotals(customersToReceive, 'customer');
  const totalToPay = calculateTotals(vendorsToPay, 'vendor');

  return (
    <>
      <Modal open={openCustomerModal} onClose={handleCloseCustomerModal} aria-labelledby="customer-modal">
        <Box sx={modalStyle}>
          <Box sx={headerStyle}>
            <Typography id="customer-modal" variant="h5" component="h2" color="primary">
              Customers  (To Receive - 10+ Days Overdue)
            </Typography>
            <IconButton onClick={handleCloseCustomerModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <List dense>
            {customersToReceive.length > 0 ? (
              customersToReceive.map((customer) => {
                const daysPassed = calculateDaysPassed(customer.dueDate);
                return (
                  <ListItem key={customer.id} sx={listItemStyle}>
                    <ListItemText
                      primary={`${customer.name}: ${customer.currency} ${addThousandSeparator(
                        Math.abs(customer.pendingSaleAmount)
                      )} (${daysPassed} days passed)`}
                      primaryTypographyProps={{ fontWeight: 'medium', color: 'text.primary' }}
                    />
                  </ListItem>
                );
              })
            ) : (
              <ListItem sx={listItemStyle}>
                <ListItemText primary="No pending amounts to receive from customers past 10 days" />
              </ListItem>
            )}
          </List>
          {customersToReceive.length > 0 && (
            <Typography sx={{ mt: 2, color: 'secondary.main' }}>
              Total to receive: {customersToReceive[0].currency} {addThousandSeparator(totalToReceive)}
            </Typography>
          )}
          <Button
            onClick={handleCloseCustomerModal}
            variant="contained"
            color="primary"
            sx={{ mt: 2, borderRadius: '8px' }}
          >
            Close
          </Button>
        </Box>
      </Modal>

      <Modal open={openVendorModal} onClose={handleCloseVendorModal} aria-labelledby="vendor-modal">
        <Box sx={modalStyle}>
          <Box sx={headerStyle}>
            <Typography id="vendor-modal" variant="h5" component="h2" color="primary">
              Customers/Vendors (To Pay - 10+ Days Overdue)
            </Typography>
            <IconButton onClick={handleCloseVendorModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <List dense>
            {vendorsToPay.length > 0 ? (
              vendorsToPay.map((entity) => {
                const daysPassed = calculateDaysPassed(entity.dueDate);
                return (
                  <ListItem key={entity.id} sx={listItemStyle}>
                    <ListItemText
                      primary={`${entity.name}: ${entity.currency} ${addThousandSeparator(
                        Math.abs(entity.pendingPurchaseAmount || entity.pendingSaleAmount)
                      )} (${daysPassed} days passed)`}
                      primaryTypographyProps={{ fontWeight: 'medium', color: 'text.primary' }}
                    />
                  </ListItem>
                );
              })
            ) : (
              <ListItem sx={listItemStyle}>
                <ListItemText primary="No pending amounts to pay past 10 days" />
              </ListItem>
            )}
          </List>
          {vendorsToPay.length > 0 && (
            <Typography sx={{ mt: 2, color: 'secondary.main' }}>
              Total to pay: {vendorsToPay[0]?.currency} {addThousandSeparator(totalToPay)}
            </Typography>
          )}
          <Button
            onClick={handleCloseVendorModal}
            variant="contained"
            color="primary"
            sx={{ mt: 2, borderRadius: '8px' }}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default GlobalAlert;
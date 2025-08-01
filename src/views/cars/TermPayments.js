import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { fetchTermPaymentsList } from 'store/car/carActions';
import BackDropLoading from 'views/utilities/BackDropLoading';
import AddTermPayment from './AddTermPayment';
import { Button } from '@mui/material';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  },
  '.MuiPaper-root': {
    maxWidth: '900px !important',
    width: '100% !important'
  }
}));

function TermPayments(props) {
  const dispatch = useDispatch();
  const termPaymentList = useSelector((state) => state.car.termPList);
  const loading = useSelector((state) => state.car.loading);
  const [addTermPayment, setAddTermPayment] = useState(false);
  const userData = useSelector((state) => state.user.user);

  // Calculate total payments made
  const calculateTotalPayments = () => {
    return termPaymentList.reduce((total, row) => {
      if (props.carStatus === true && row.cashOut) {
        return total + parseFloat(row.cashOut || 0);
      } else if (props.carStatus === false && row.cashIn) {
        return total + parseFloat(row.cashIn || 0);
      }
      return total;
    }, 0);
  };

  // Calculate remaining pending amount
  const initialPending = parseFloat(props.pendingPayment || 0);
  const totalPayments = calculateTotalPayments();
  const remainingPending = initialPending - totalPayments;

  const handleClose = () => {
    props.setTermPaymentsOpen(false);
  };

  const handleClickAddPaymentOpen = () => {
    setAddTermPayment(true);
  };

  useEffect(() => {
    if (props.carID) {
      dispatch(fetchTermPaymentsList(props.carID));
    }
  }, [dispatch, props.carID]);

  return (
    <>
      {loading === true ? <BackDropLoading /> : null}
      <AddTermPayment
        carID={props.carID}
        addTermPayment={addTermPayment}
        setAddTermPayment={setAddTermPayment}
        saleCurrency={props.saleCurrency}
        carStatus={props.carStatus}
        pendingPayment={props.pendingPayment}
      />
      <BootstrapDialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={props.termPaymentsOpen}>
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{ fontSize: '20px' }}>
          {props.carName} Payment Terms {props.paymentType}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ color: '#e82d2d' }}>
                Total: {initialPending}
              </h3>
              <h3 style={{ color: '#e82d2d' }}>
                Pending: {remainingPending.toFixed(2)}
              </h3>
            </div>
            {userData.userRole !== 'Admin' && remainingPending !== 0 ? (
              <div style={{ textAlign: 'right' }}>
                <Button size="large" type="button" variant="contained" color="secondary" onClick={handleClickAddPaymentOpen}>
                  Add Payment Term
                </Button>
              </div>
            ) : null}
          </div>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Cost</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell>Cheque No</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {termPaymentList.map((row) =>
                  props.carStatus === true ? (
                    row.cashOut ? (
                      <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component="th" scope="row">
                          {row.cashOut}
                        </TableCell>
                        <TableCell>{row.currency}</TableCell>
                        <TableCell>{row.chequeNo}</TableCell>
                        <TableCell>{row.details}</TableCell>
                      </TableRow>
                    ) : null
                  ) : row.cashIn ? (
                    <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row">
                        {row.cashIn}
                      </TableCell>
                      <TableCell>{row.currency}</TableCell>
                      <TableCell>{row.chequeNo}</TableCell>
                      <TableCell>{row.details}</TableCell>
                    </TableRow>
                  ) : null
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </BootstrapDialog>
    </>
  );
}

export default TermPayments;
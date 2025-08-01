import React, { useEffect, useState } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, FormControl, InputLabel } from '@mui/material';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { downloadPdf } from 'views/utilities/downloadPdf';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomerReportList } from 'store/reports/reportsActions';
import BackDropLoading from 'views/utilities/BackDropLoading';
import { IconDownload } from '@tabler/icons';
import { fetchCustomerList } from 'store/customer/customerActions';

const columns = ['Model', 'Chassis No', 'Customer Name', 'Sale Price', 'Total Expense', 'Profit', 'Loss'];

function CustomerReport() {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.reports.loading);
  const customerData = useSelector((state) => state.reports.cReportList || []); // Default to empty array
  const customerList = useSelector((state) => state.customer.clist || []); // Default to empty array
  const [searchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectCustomer, setSelectCustomer] = useState('');

  const addThousandSeparator = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    dispatch(fetchCustomerReportList(selectCustomer));
    dispatch(fetchCustomerList());
  }, [dispatch, selectCustomer]);

  // Guard against non-array customerData
  const filteredData = Array.isArray(customerData)
    ? customerData.filter((row) =>
        row.model.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const totalProfit = filteredData.reduce((accumulator, current) => accumulator + (current.profit || 0), 0);
  const totalLoss = filteredData.reduce((accumulator, current) => accumulator + (current.loss || 0), 0);

  const handelDownloadPdf = () => {
    const fileName = 'Customer Report';
    const rows = filteredData.map((row) => [
      row.model,
      row.chassisNo,
      row.customerName,
      `${addThousandSeparator(row.salePrice)} ${row.saleCurrency}`,
      `${addThousandSeparator(row.totalExpense)} ${row.purchaseCurrency}`,
      `${addThousandSeparator(row.profit)} ${row.purchaseCurrency}`,
      `${addThousandSeparator(row.loss)} ${row.purchaseCurrency}`
    ]);
    downloadPdf(rows, columns, fileName, totalProfit, totalLoss);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handelSelectCustomer = (e) => {
    setSelectCustomer(e.target.value);
  };

  return (
    <>
      {loading ? <BackDropLoading /> : null}
      <div className="report-main-box">
        <div className="report-toolbar">
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel id="selectCustomer">Select Customer</InputLabel>
            <Select
              labelId="selectCustomer"
              id="selectCustomer"
              value={selectCustomer}
              label="Select Customer"
              onChange={handelSelectCustomer}
            >
              <MenuItem value="">
                <em>All Customers</em>
              </MenuItem>
              {customerList.map((item, i) => (
                <MenuItem value={item.id} key={i}>
                  {item.firstName} {item.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<IconDownload />}
            onClick={handelDownloadPdf}
          >
            Download Report
          </Button>
        </div>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column}>{column}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : filteredData
              ).map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.model}</TableCell>
                  <TableCell>{row.chassisNo}</TableCell>
                  <TableCell>{row.customerName}</TableCell>
                  <TableCell>{addThousandSeparator(row.salePrice)} {row.saleCurrency}</TableCell>
                  <TableCell>{addThousandSeparator(row.totalExpense)} {row.purchaseCurrency}</TableCell>
                  <TableCell>{addThousandSeparator(row.profit)} {row.purchaseCurrency}</TableCell>
                  <TableCell>{addThousandSeparator(row.loss)} {row.purchaseCurrency}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </div>
    </>
  );
}

export default CustomerReport;
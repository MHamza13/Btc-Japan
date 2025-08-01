import React, { useEffect, useState } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, FormControl, InputLabel, } from '@mui/material';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { downloadPdf } from 'views/utilities/downloadPdf';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPurchaseCountryReportList } from 'store/reports/reportsActions';
import BackDropLoading from 'views/utilities/BackDropLoading';
import { IconDownload } from '@tabler/icons';
import { fetchCountryList } from 'store/country/countryActions';



const columns = ['Model', 'Chassis No', 'Vendor Name', 'Purchase Price', 'Total Expense', 'Profit', 'Loss'];



function PurchaseCountryReport(){
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.reports.loading);
    const pCReportData = useSelector((state) => state.reports.pCReportList);
    const countryList = useSelector((state) => state.countries.list);
    const [searchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectCountry, setSelectCountry] = useState([]);

    const addThousandSeparator = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    
    useEffect(()=>{
        dispatch(fetchPurchaseCountryReportList(selectCountry))
        dispatch(fetchCountryList())
    }, [dispatch, selectCountry])
    
    const filteredData = pCReportData.filter(row =>
        row.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // console.log(setSearchTerm)

    const totalProfit = filteredData.reduce((accumulator,current) => accumulator += current.profit - 0, 0)
    const totalLoss = filteredData.reduce((accumulator,current) => accumulator += current.loss - 0, 0)

    const handelDownloadPdf = () =>{
        const fileName = 'Purchase Country';
        const rows = filteredData.map(row => [
            row.model, 
            row.chassisNo, 
            row.vendorName,
            addThousandSeparator(row.purchasePrice)+' '+row.purchaseCurrency,
            addThousandSeparator(row.totalExpense)+' '+row.purchaseCurrency,
            addThousandSeparator(row.profit)+' '+row.purchaseCurrency,
            addThousandSeparator(row.loss)+' '+row.purchaseCurrency
        ]);
        downloadPdf(rows, columns, fileName, totalProfit, totalLoss)
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handelSelectCountry = (e) =>{
        setSelectCountry(e.target.value)
    }
    return(<>
        {loading ? <BackDropLoading /> : null}
        <div className='report-main-box'>
            <div className='report-toolbar'>
                <FormControl sx={{minWidth: 300 }}>
                    <InputLabel id="selectCountry">Select Country</InputLabel>
                    <Select
                        labelId="selectCountry"
                        id="selectCountry"
                        value={selectCountry}
                        label="Select Country"
                        onChange={handelSelectCountry}
                    >
                        <MenuItem value="">
                            <em>Select Country</em>
                        </MenuItem>
                        {countryList === null ? null : countryList.map((item, i)=>{
                            return <MenuItem value={item.id} key={i}>{item.name}</MenuItem>;
                        })}
                    </Select>
                </FormControl>
                <Button
                    variant="contained" color="secondary"
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
                        {columns.map(column =>{
                            return <TableCell key={column}>{column}</TableCell>
                        })}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(rowsPerPage > 0
                        ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : filteredData
                    ).map(row => (
                        <TableRow key={row.id}>
                            <TableCell>{row.model}</TableCell>
                            <TableCell>{row.chassisNo}</TableCell>
                            <TableCell>{row.vendorName}</TableCell>
                            <TableCell>{addThousandSeparator(row.purchasePrice)} {row.purchaseCurrency}</TableCell>
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
                onChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </TableContainer>
        </div>
    </>)
}





export default PurchaseCountryReport;
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
// import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { expenseDelete, fetchExpenseList } from 'store/car/carActions';
import BackDropLoading from 'views/utilities/BackDropLoading';
import { IconEdit, IconFileText, IconTrash } from '@tabler/icons';
import { Tooltip } from '@mui/material';
import AddExpenses from './AddExpenses';
import { imageUrl } from 'utils/ApiUrls';
// import { Link } from 'react-router-dom';





const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
    '.MuiPaper-root': {
        maxWidth: '900px !important', 
        width: '100% !important'
    }
}));


function ViewExpense(props) {
    const dispatch = useDispatch();
    const expenseList = useSelector((state) => state.car.exList);
    const loading = useSelector((state) => state.car.loading);
    const userData = useSelector((state) => state.user.user);
    const [id, setId] = useState(0);
    const [expenseOpen, setExpenseOpen] = useState(false);

    const handleClose = () => {
        props.setExpenseViewOpen(false);
    };

    const handleClickExpenseOpen = (id) => {
        setExpenseOpen(true);
        setId(id)
        console.log(id)
    };


    useEffect(()=>{
        if(props.carID){
            dispatch(fetchExpenseList(props.carID))
        }
    }, [dispatch, props.carID]);


    const deleteExpense = (id) =>{
        dispatch(expenseDelete(id, props.carID));
    }

    

    return(<>
        {loading === true ? <BackDropLoading /> : null}
        <AddExpenses expenseOpen={expenseOpen} setExpenseOpen={setExpenseOpen} carID={props.carID} id={id} />
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={props.expenseViewOpen}
        >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" style={{fontSize: '20px'}}>
                {props.carName} Expenses List
            </DialogTitle>
            <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
            }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent dividers>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Cost</TableCell>
                                <TableCell>Currency</TableCell>
                                <TableCell>Doc</TableCell>
                                <TableCell>Details</TableCell>
                                {userData.userRole !== 'Admin' || userData.userRole !== 'AgentSales' ? <>{props.carStatus ? <TableCell align="right">Actions</TableCell> : null }</>:null}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {expenseList.map((row) => (
                            <TableRow
                            key={row.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                            <TableCell component="th" scope="row">
                                {row.cost}
                            </TableCell>
                            <TableCell>{row.currency}</TableCell>
                            <TableCell>
                                {row.document.includes('.pdf') ? <a href={`${imageUrl}cars/${row.document}`} target='_blank' rel="noreferrer">
                                   <Tooltip title="View File"><IconFileText /></Tooltip>
                                </a>: <a href={`${imageUrl}cars/${row.document}`} target='_blank' rel="noreferrer">
                                    <img src={`${imageUrl}cars/${row.document}`} alt='Doc' style={{width: '50px'}} />
                                </a>}
                            </TableCell>
                            <TableCell>{row.details}</TableCell>
                            {userData.userRole !== 'Admin' || userData.userRole !== 'AgentSales' ? <>
                            {props.carStatus ? 
                                <TableCell align="right">
                                    <Tooltip title="Add Expense">
                                        <IconButton size="small" onClick={()=> handleClickExpenseOpen(row.id)} >
                                            <IconEdit />
                                        </IconButton>
                                    </Tooltip>
                                    <IconButton size="small" sx={{ color: 'error.main' }} onClick={()=> deleteExpense(row.id)}>
                                        <IconTrash />
                                    </IconButton>
                                </TableCell>
                            : null}</>:null}
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            {/* <DialogActions>
                <Button autoFocus variant="contained" color="secondary">
                    Save changes
                </Button>
            </DialogActions> */}
        </BootstrapDialog>
    </>);
}





export default ViewExpense;
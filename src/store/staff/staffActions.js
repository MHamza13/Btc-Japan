// staffActions.js
import axios from 'axios';
import moment from 'moment';
import Swal from 'sweetalert2';
import { apiURL } from 'utils/ApiUrls';
import { encryptStorage } from './../../utils/storage';


// Action types
export const StaffList = 'StaffList';
export const EditStaffList = 'EditStaffList'
export const SET_LOADING = 'SET_LOADING';
export const ExpenseList = 'ExpenseList';
export const EditExList = 'EditExList';
export const SalaryType = 'SalaryType';
export const AttendanceStatus = 'AttendanceStatus';
export const AttendanceList = 'AttendanceList';
export const SalaryList = 'SalaryList';

export const setLoading = (isLoading) => ({
    type: SET_LOADING,
    payload: isLoading,
});

//Staff List Function
export const fetchStaffList = () => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try {
        dispatch(setLoading(true));
        const staffListData = await axios.get(apiURL+'Staff', {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(staffListData.data)
        dispatch({
            type: StaffList,
            payload: staffListData.data,
        });
        dispatch(setLoading(false));
    } catch (error) {
        dispatch(setLoading(false));
        Swal.fire({
            title: "Error!",
            text: error,
            icon: "error"
        });
    }
};

//Salary Type List Function
export const fetchSalaryTypeList = () => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try {
        dispatch(setLoading(true));
        const salaryTypeListData = await axios.get(apiURL+'Staff/salarytypes', {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(salaryTypeListData.data)
        dispatch({
            type: SalaryType,
            payload: salaryTypeListData.data,
        });
        dispatch(setLoading(false));
    } catch (error) {
        dispatch(setLoading(false));
        Swal.fire({
            title: "Error!",
            text: error,
            icon: "error"
        });
    }
};

// Add Staff Function
export const addStaff = (staffData, navigate) => async (dispatch) =>{
    const token = encryptStorage.getItem('b68f38dbe5a2');
    dispatch(setLoading(true));
    try{
        await axios.post(apiURL+'Staff/addedit?Id=0', staffData, {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }}).then((res)=>{  
            dispatch(setLoading(false));
            console.log(res.data);
            Swal.fire({
                title: "Added",
                text: 'Staff Added Successfully',
                icon: "success"
            });
            navigate('/staff/listing', { replace: true });
        }) ;
        
    } catch (error){
        dispatch(setLoading(false));
        Swal.fire({
            title: "Error!",
            text: error,
            icon: "error"
        });
    }
}


// Edit Staff List Function
export const fetchEditStaffList = (id) => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try {
        dispatch(setLoading(true));
        const staffEditListData = await axios.get(apiURL+'Staff?Id='+id, {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(staffEditListData.data[0])
        dispatch({
            type: EditStaffList,
            payload: staffEditListData.data[0],
        });
        dispatch(setLoading(false));
    } catch (error) {
        dispatch(setLoading(false));
        Swal.fire({
            title: "Error!",
            text: error,
            icon: "error"
        });
    }
};

// Update Staff Function
export const updateStaff = (id, staffData, navigate) => async (dispatch) =>{
    const token = encryptStorage.getItem('b68f38dbe5a2');
    dispatch(setLoading(true));
    try{
        await axios.post(apiURL+'Staff/addedit', staffData, {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }}).then((res)=>{  
            dispatch(setLoading(false));
            console.log(res.data);
            dispatch(fetchStaffList());
            Swal.fire({
                title: "Updated",
                text: 'Staff Updated Successfully',
                icon: "success"
            });
            navigate('/staff/listing', { replace: true });
        }) ;
        
    } catch (error){
        dispatch(setLoading(false));
        Swal.fire({
            title: "Error!",
            text: error,
            icon: "error"
        });
    }
}

// Staff Delete Function
export const staffDelete = (id) => async (dispatch) =>{
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try{
        Swal.fire({
            title: "Delete",
            text: "You want to delete this Staff",
            icon: "question",
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: "Yes",
            denyButtonText: `No`
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(setLoading(true));
                axios.post(apiURL+'Staff/delete', {id: id}, {headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'multipart/form-data',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Authorization': `Bearer ${token}`
                }}).then(()=>{  
                    dispatch(fetchStaffList());
                    dispatch(setLoading(false));
                    Swal.fire({
                        title: "Deleted!",
                        text: 'Staff Deleted Successfully',
                        icon: "success"
                    });
                })
            }
        });
    } catch (error){
        dispatch(setLoading(false));
        Swal.fire({
            title: "Error!",
            text: error,
            icon: "error"
        });
    }
}



// Attendance Status List Function
export const fetchStaffAttendanceStatusList = () => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try {
        dispatch(setLoading(true));
        const staffAttendanceStatusListData = await axios.get(apiURL+'Staff/attendancestatus', {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(staffAttendanceStatusListData.data)
        dispatch({
            type: AttendanceStatus,
            payload: staffAttendanceStatusListData.data,
        });
        dispatch(setLoading(false));
    } catch (error) {
        dispatch(setLoading(false));
        Swal.fire({
            title: "Error!",
            text: error,
            icon: "error"
        });
    }
};



// Attendance List Function
export const fetchStaffAttendanceList = (date, staffId) => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try {
        dispatch(setLoading(true));
        const staffAttendanceListData = await axios.get(apiURL+'Staff/Attendance?StaffId='+staffId+'&Date='+date+'&Month='+date, {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(staffAttendanceListData.data)
        dispatch({
            type: AttendanceList,
            payload: staffAttendanceListData.data,
        });
        dispatch(setLoading(false));
    } catch (error) {
        dispatch(setLoading(false));
        // Swal.fire({
        //     title: "Error!",
        //     text: error,
        //     icon: "error"
        // });
        // console.log(error)
    }
};



// Add Attendance Status Function
export const addAttendanceStatus = (aStatusData) => async (dispatch) =>{
    const token = encryptStorage.getItem('b68f38dbe5a2');
    const todayDate = moment().format("YYYY-MM-DD");
    const staffId = '';
    try{
        dispatch(setLoading(true));
        await axios.post(apiURL+'Staff/addeditattendance', aStatusData, {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }}).then(()=>{  
            dispatch(fetchStaffAttendanceList(todayDate, staffId))
            dispatch(setLoading(false));
            // console.log(res.data);
            // Swal.fire({
            //     title: "Added",
            //     text: 'Attendance Added Successfully',
            //     icon: "success"
            // });
        });
        
    } catch (error){
        dispatch(setLoading(false));
        Swal.fire({
            title: "Error!",
            text: error,
            icon: "error"
        });
    }
}


// Salary List Function
export const fetchStaffSalaryList = (staffId, date) => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    // const formattedDateArray = date.map(date => {
    //     const isoString = date.toISOString();
    //     return isoString.split('T')[0];
    // });
    try {
        dispatch(setLoading(true));
        const staffSalaryListData = await axios.get(apiURL+'Staff/salary?StaffId='+staffId+'&StartDate='+date[0]+'&EndDate='+date[1], {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(staffSalaryListData.data)
        dispatch({
            type: SalaryList,
            payload: staffSalaryListData.data,
        });
        dispatch(setLoading(false));
    } catch (error) {
        dispatch(setLoading(false));
        // Swal.fire({
        //     title: "Error!",
        //     text: error,
        //     icon: "error"
        // });
        // console.log(error)
    }
};



// Add Attendance Status Function
export const processSalary = (pSalaryData, staffId, datevalue) => async (dispatch) =>{
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try{
        dispatch(setLoading(true));
        await axios.post(apiURL+'Staff/processsalary', pSalaryData, {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }}).then(()=>{  
            // console.log(res.data);
            dispatch(fetchStaffSalaryList(staffId, datevalue))
            dispatch(setLoading(false));
            Swal.fire({
                // title: "Added",
                text: 'Salary Processed Successfully',
                icon: "success"
            });
        });
        
    } catch (error){
        dispatch(setLoading(false));
        Swal.fire({
            title: "Error!",
            text: error,
            icon: "error"
        });
    }
}
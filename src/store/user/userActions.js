// userActions.js
import axios from 'axios';
import Swal from 'sweetalert2';
import { apiURL } from 'utils/ApiUrls';
import { encryptStorage, encryptUserID } from './../../utils/storage';


// Action types
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';
export const USERS_LIST = 'USERS_LIST';
export const SET_LOADING = 'SET_LOADING';

export const setLoading = (isLoading) => ({
    type: SET_LOADING,
    payload: isLoading,
});

export const loginUser = (userData, navigate) => async (dispatch) => 
{
    // console.log(userData)
    dispatch(setLoading(true));
    try {
        const response = await axios.post(apiURL+'Auth/login', userData, {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
        }});
        // console.log(response.data)
        const token = response.data.token;
        encryptStorage.setItem('b68f38dbe5a2', token);
        encryptUserID.setItem('IDb68f38dbe5a2', response.data.userId);

        axios.get(apiURL+'Users/userinfo?id='+response.data.userId, {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }}).then((res)=>{
            // console.log(res.data)
            dispatch({
                type: LOGIN_SUCCESS,
                payload: res.data[0],
                isAuthenticated: true,
            });
            navigate('/dashboard', { replace: true });
        })
        dispatch(setLoading(false));
        // console.log(userGetData.data.success)
    } catch (error) {
        dispatch(setLoading(false));
        dispatch({
            type: LOGIN_FAILURE,
            payload: error,
        });
        if(error.response.status === 401){
            Swal.fire({
                title: "Unauthorized!",
                text: 'Invaild Username & Password',
                icon: "error"
            });
        } else{
            // console.log(error.response.status)
            Swal.fire({
                title: 'Error',
                text: error,
                icon: "error"
            });
        }
    }
};


export const UserDetails = () => async (dispatch) =>{
    const userID = encryptUserID.getItem('IDb68f38dbe5a2');
    const token = encryptStorage.getItem('b68f38dbe5a2');
    dispatch(setLoading(true));
    try{
        const response = await axios.get(apiURL+'Users/userinfo?id='+userID, {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(response.data)
        dispatch({
            type: LOGIN_SUCCESS,
            payload: response.data[0],
            isAuthenticated: true,
        });
        dispatch(setLoading(false));
    }catch (error) {
        dispatch(setLoading(false));
        dispatch({
            type: LOGIN_FAILURE,
            payload: error,
        });
        if(error.response.status === 401){
            encryptStorage.removeItem('b68f38dbe5a2');
            encryptUserID.removeItem('IDb68f38dbe5a2');
            location.replace("/login"); 
            window.location.reload();
        }
    }
}


export const fetchUsersList = () => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try {
        dispatch(setLoading(true));
        const userListData = await axios.get(apiURL+'users', {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(userListData.data)
        dispatch({
            type: USERS_LIST,
            payload: userListData.data,
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



export const addUser = (userData, navigate) => async (dispatch) =>{
    dispatch(setLoading(true));
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try{
        await axios.post(apiURL+'Auth/register', userData, {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }}).then(()=>{  
            dispatch(setLoading(false));
            Swal.fire({
                title: "Added",
                text: 'User Added Successfully',
                icon: "success"
            });
            navigate('/user/listing', { replace: true });
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


export const updatePassword = (userData, navigate) => async (dispatch) =>{
    dispatch(setLoading(true));
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try{
        await axios.post(apiURL+'Auth/changepass', userData, {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }}).then(()=>{  
            dispatch(setLoading(false));
            Swal.fire({
                title: "Updated",
                text: 'Updated Password Successfully',
                icon: "success"
            });
            navigate('/dashboard', { replace: true });
        }) ;
        
    } catch (error){
        dispatch(setLoading(false));
        if(error.response.status === 400){
            Swal.fire({
                title: "Error!",
                text: 'Current password is incorrect.',
                icon: "error"
            });
        } else{
            // console.log(error.response.status)
            Swal.fire({
                title: 'Error',
                text: error,
                icon: "error"
            });
        }
        // Swal.fire({
        //     title: "Error!",
        //     text: error,
        //     icon: "error"
        // });
    }
}



// User Delete Function
export const userDelete = (id) => async (dispatch) =>{
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try{
        Swal.fire({
            title: "Delete",
            text: "You want to delete this User",
            icon: "question",
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: "Yes",
            denyButtonText: `No`
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(setLoading(true));
                axios.post(apiURL+'users/delete', {UserId: id}, {headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'multipart/form-data',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Authorization': `Bearer ${token}`
                }}).then(()=>{  
                    dispatch(fetchUsersList());
                    dispatch(setLoading(false));
                    Swal.fire({
                        title: "Deleted!",
                        text: 'User Deleted Successfully',
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


export const logoutUser = () => (dispatch) => {
    encryptStorage.removeItem('b68f38dbe5a2');
    encryptUserID.removeItem('IDb68f38dbe5a2');
    dispatch({
        type: LOGOUT,
    });
    Swal.fire({
        title: "Successfully logged out",
        icon: "success",
        buttons: false,
        timer: 1500,
    })
    location.replace("/login"); 
    window.location.reload();
    
};


// Check for a stored token during application initialization
export const checkAuth = (navigate) => (dispatch) => {
    const userID = encryptUserID.getItem('IDb68f38dbe5a2');
    if (userID) {
        dispatch(UserDetails());
    } else {
        encryptStorage.removeItem('b68f38dbe5a2');
        encryptUserID.removeItem('IDb68f38dbe5a2');
        // location.replace("/login"); 
        // window.location.reload();
        navigate('/login', { replace: true });
    }
};
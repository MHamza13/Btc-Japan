// countryActions.js
import axios from 'axios';
import Swal from 'sweetalert2';
import { apiURL } from 'utils/ApiUrls';
import { encryptStorage } from './../../utils/storage';


// Action typescurrencies
export const GET_LIST = 'GET_LIST';
export const GET_CURRENCIES_LIST = 'GET_CURRENCIES_LIST';
export const SET_LOADING = 'SET_LOADING';

export const setLoading = (isLoading) => ({
    type: SET_LOADING,
    payload: isLoading,
});

export const fetchCountryList = () => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try {
        dispatch(setLoading(true));
        const countryListData = await axios.get(apiURL+'users/countries', {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(countryListData.data)
        dispatch({
            type: GET_LIST,
            payload: countryListData.data,
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

export const fetchCurrenciesList = () => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try {
        dispatch(setLoading(true));
        const currenciesListData = await axios.get(apiURL+'country/currencies', {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(currenciesListData.data)
        dispatch({
            type: GET_CURRENCIES_LIST,
            payload: currenciesListData.data,
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



// export const updateStatus = (statusData, id) => async (dispatch) =>{
//     try {
//         dispatch(setLoading(true));
//         const token = encryptStorage.getItem('b68f38dbe5a2');
//         await axios.post(apiURL+'wordpresslinksite/changestatus/'+id, {status: statusData}, {headers: {
//             'Access-Control-Allow-Origin': '*',
//             'Content-Type': 'application/json',
//             'Access-Control-Allow-Headers': 'Content-Type',
//             'Authorization': `Bearer ${token}`,
//         }}).then(()=>{  
//             dispatch(fetchSiteList());
//             dispatch(setLoading(false));
//             Swal.fire({
//                 title: "Status",
//                 text: 'Status Updated Successfully',
//                 icon: "success"
//             });
//         })
//     } catch (error){
//         dispatch(setLoading(false));
//         Swal.fire({
//             title: "Error!",
//             text: error,
//             icon: "error"
//         });
//     }
// }


// export const wSiteDelete = (id) => async (dispatch) =>{
//     try{
//         const token = encryptStorage.getItem('b68f38dbe5a2');
//         Swal.fire({
//             title: "Delete",
//             text: "You want to delete this site",
//             icon: "question",
//             showDenyButton: true,
//             showCancelButton: false,
//             confirmButtonText: "Yes",
//             denyButtonText: `No`
//         }).then((result) => {
//             if (result.isConfirmed) {
//                 dispatch(setLoading(true));
//                 axios.delete(apiURL+'wordpresslinksite/'+id, {headers: {
//                     'Access-Control-Allow-Origin': '*',
//                     'Content-Type': 'application/json',
//                     'Access-Control-Allow-Headers': 'Content-Type',
//                     'Authorization': `Bearer ${token}`,
//                 }}).then(()=>{  
//                     dispatch(fetchSiteList());
//                     dispatch(setLoading(false));
//                     Swal.fire({
//                         title: "Deleted!",
//                         text: 'Site Deleted Successfully',
//                         icon: "success"
//                     });
//                 })
//             }
//         });
//     } catch (error){
//         dispatch(setLoading(false));
//         Swal.fire({
//             title: "Error!",
//             text: error,
//             icon: "error"
//         });
//     }
// }
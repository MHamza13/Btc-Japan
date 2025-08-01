// reportsActions.js
import axios from 'axios';
import Swal from 'sweetalert2';
import { apiURL } from 'utils/ApiUrls';
import { encryptStorage } from './../../utils/storage';


// Action types
export const CustomerReportList = 'CustomerReportList';
export const VendorReportList = 'VendorReportList'
export const PurchaseCountryReportList = 'PurchaseCountryReportList'
export const SaleCountryReportList = 'SaleCountryReportList'
export const AvailabilityReportList = 'AvailabilityReportList';
export const SET_LOADING = 'SET_LOADING';


export const setLoading = (isLoading) => ({
    type: SET_LOADING,
    payload: isLoading,
});

export const fetchCustomerReportList = (id) => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try {
        dispatch(setLoading(true));
        const cReportListData = await axios.get(apiURL+'Reports/bycustomer?CustomerId='+id, {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(cReportListData.data)
        dispatch({
            type: CustomerReportList,
            payload: cReportListData.data,
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


export const fetchVendorReportList = (id) => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try {
        dispatch(setLoading(true));
        const vReportListData = await axios.get(apiURL+'Reports/byvendor?VendorId='+id, {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(vReportListData.data)
        dispatch({
            type: VendorReportList,
            payload: vReportListData.data,
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

export const fetchPurchaseCountryReportList = (id) => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try {
        dispatch(setLoading(true));
        const pCReportListData = await axios.get(apiURL+'Reports/bypurchasecountry?CountryId='+id, {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(pCReportListData.data)
        dispatch({
            type: PurchaseCountryReportList,
            payload: pCReportListData.data,
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

export const fetchSaleCountryReportList = (id) => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try {
        dispatch(setLoading(true));
        const sCReportListData = await axios.get(apiURL+'Reports/bysalecountry?CountryId='+id, {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(sCReportListData.data)
        dispatch({
            type: SaleCountryReportList,
            payload: sCReportListData.data,
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


export const fetchAvailabilityReporttList = (id) => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try {
        dispatch(setLoading(true));
        const aVReportListData = await axios.get(apiURL+'Reports/byavailability?IsAvailable='+id, {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(aVReportListData.data)
        dispatch({
            type: AvailabilityReportList,
            payload: aVReportListData.data,
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
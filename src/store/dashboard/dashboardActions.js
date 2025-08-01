// vendorActions.js
import axios from 'axios';
import Swal from 'sweetalert2';
import { apiURL } from 'utils/ApiUrls';
import { encryptStorage } from './../../utils/storage';


// Action types
export const DashboardStatsList = 'DashboardStatsList';
export const PurchaseChart = 'PurchaseChart'
export const SaleseChart = 'SaleseChart'
export const SET_LOADING = 'SET_LOADING';
export const PendingPayments = 'PendingPayments'
export const PendingTerms = 'PendingTerms';

export const setLoading = (isLoading) => ({
    type: SET_LOADING,
    payload: isLoading,
});

export const fetchDashboardStatsList = () => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    try {
        dispatch(setLoading(true));
        const dStatsListData = await axios.get(apiURL+'Dashboard/stats', {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(dStatsListData.data)
        dispatch({
            type: DashboardStatsList,
            payload: dStatsListData.data,
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


export const fetchPurchaseChartList = (purchaseChartDate) => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    const formattedDateArray = purchaseChartDate.map(date => {
        const isoString = date.toISOString();
        return isoString.split('T')[0];
    });
    try {
        dispatch(setLoading(true));
        const PurchaseChartData = await axios.get(apiURL+'Dashboard/purchasechartdata?StartMonth='+formattedDateArray[0]+'&EndMonth='+formattedDateArray[1], {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(PurchaseChartData.data)
        dispatch({
            type: PurchaseChart,
            payload: PurchaseChartData.data,
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

export const fetchSaleseChartList = (purchaseChartDate) => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    const formattedDateArray = purchaseChartDate.map(date => {
        const isoString = date.toISOString();
        return isoString.split('T')[0];
    });
    try {
        dispatch(setLoading(true));
        const salesChartData = await axios.get(apiURL+'Dashboard/saleschartdata?StartMonth='+formattedDateArray[0]+'&EndMonth='+formattedDateArray[1], {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(salesChartData.data)
        dispatch({
            type: SaleseChart,
            payload: salesChartData.data,
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


export const fetchPendingPaymentsList = (countryId) => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    const Id = countryId === undefined ? '' : countryId;
    try {
        dispatch(setLoading(true));
        const pendingPaymentsListData = await axios.get(apiURL+'Dashboard/PendingPaymentDetails?CountryId='+Id, {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(pendingPaymentsListData.data)
        dispatch({
            type: PendingPayments,
            payload: pendingPaymentsListData.data,
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


export const fetchPendingTermsList = (countryId) => async (dispatch) => {
    const token = encryptStorage.getItem('b68f38dbe5a2');
    const Id = countryId === undefined ? '' : countryId;
    try {
        dispatch(setLoading(true));
        const pendingTermsListData = await axios.get(apiURL+'Dashboard/PendingTerms?CountryId='+Id, {headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Authorization': `Bearer ${token}`
        }});
        // console.log(pendingTermsListData.data)
        dispatch({
            type: PendingTerms,
            payload: pendingTermsListData.data,
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
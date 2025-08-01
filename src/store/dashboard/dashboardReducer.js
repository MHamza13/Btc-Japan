// dashboardReducer.js
import { DashboardStatsList, SET_LOADING, PurchaseChart, SaleseChart, PendingPayments, PendingTerms } from './dashboardActions';



const initialState = {
    statsList: [],
    pChartList: [],
    sChartList: [],
    pendingPayments: [],
    pendingTerms: [],
    loading: false,
    error: null,
};
  
const dashboardReducer = (state = initialState, action) => {
    switch (action.type) {
        case DashboardStatsList:
            return {
                ...state,
                statsList: action.payload,
                error: null,
            };
        case PurchaseChart:
            return {
                ...state,
                pChartList: action.payload,
                error: null,
            };
        case SaleseChart:
            return {
                ...state,
                sChartList: action.payload,
                error: null,
            };
        case PendingPayments:
            return {
                ...state,
                pendingPayments: action.payload,
                error: null,
            };
        case PendingTerms:
            return {
                ...state,
                pendingTerms: action.payload,
                error: null,
            };
        case SET_LOADING:
            return {
                ...state,
                loading: action.payload,
            };
        default:
            return state;
    }
};
  
export default dashboardReducer;
// reportsReducer.js
import { CustomerReportList, SET_LOADING, VendorReportList, PurchaseCountryReportList, SaleCountryReportList, AvailabilityReportList } from './reportsActions';



const initialState = {
    cReportList: [],
    vReportList: [],
    pCReportList: [],
    sCReportList: [],
    aVReportList: [],
    loading: false,
    error: null,
};
  
const reportsReducer = (state = initialState, action) => {
    switch (action.type) {
        case CustomerReportList:
            return {
                ...state,
                cReportList: action.payload,
                error: null,
            };
        case VendorReportList:
            return {
                ...state,
                vReportList: action.payload,
                error: null,
            };
        case PurchaseCountryReportList:
            return {
                ...state,
                pCReportList: action.payload,
                error: null,
            };
        case SaleCountryReportList:
            return {
                ...state,
                sCReportList: action.payload,
                error: null,
            };
        case AvailabilityReportList:
                return {
                    ...state,
                    aVReportList: action.payload,
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
  
export default reportsReducer;
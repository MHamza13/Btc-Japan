// vendorReducer.js
import { VendorList, SET_LOADING, EditVendorList, VendorLedgerList, LedgerDetailsList, VendorMoveList } from './vendorActions';



const initialState = {
    vlist: [],
    vmovelist: [],
    vEditList: [],
    vLedgerList: [],
    vLedgerDetailsList: [],
    loading: false,
    error: null,
};
  
const vendorReducer = (state = initialState, action) => {
    switch (action.type) {
        case VendorList:
            return {
                ...state,
                vlist: action.payload,
                error: null,
            };
        case VendorMoveList:
            return {
                ...state,
                vmovelist: action.payload,
                error: null,
            };
        case EditVendorList:
            return {
                ...state,
                vEditList: action.payload,
                error: null,
            };
        case VendorLedgerList:
            return {
                ...state,
                vLedgerList: action.payload,
                error: null,
            };
        case LedgerDetailsList:
            return {
                ...state,
                vLedgerDetailsList: action.payload,
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
  
export default vendorReducer;
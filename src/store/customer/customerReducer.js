// customerReducer.js
import { GETLIST, SET_LOADING, EditGetList, LedgerList, LedgerDetailsList } from './customerActions';



const initialState = {
    clist: [],
    cEditList: [],
    cLedgerList: [],
    cLedgerDetailList: [],
    loading: false,
    error: null,
};
  
const customerReducer = (state = initialState, action) => {
    switch (action.type) {
        case GETLIST:
            return {
                ...state,
                clist: action.payload,
                error: null,
            };
        case EditGetList:
            return {
                ...state,
                cEditList: action.payload,
                error: null,
            };
        case LedgerList:
            return {
                ...state,
                cLedgerList: action.payload,
                error: null,
            };
        case LedgerDetailsList:
            return {
                ...state,
                cLedgerDetailList: action.payload,
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
  
export default customerReducer;
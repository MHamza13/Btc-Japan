// carReducer.js
import { CarList, SET_LOADING, EditCarList, ExpenseList, EditExList, TermPaymentsList, InStockCarList, salesCarList } from './carActions';

const initialState = {
  calist: [],
  inStockcalist: [],
  salescalist: [],
  caEditList: null, 
  exList: [],
  exEditList: [],
  termPList: [],
  loading: false,
  error: null
};

const carReducer = (state = initialState, action) => {
  switch (action.type) {
    case CarList:
      return {
        ...state,
        calist: action.payload,
        error: null
      };
    case InStockCarList:
      return {
        ...state,
        inStockcalist: action.payload,
        error: null
      };
    case salesCarList:
      return {
        ...state,
        salescalist: action.payload,
        error: null
      };
    case EditCarList:
      return {
        ...state,
        caEditList: action.payload, 
        error: null
      };
    case ExpenseList:
      return {
        ...state,
        exList: action.payload,
        error: null
      };
    case EditExList:
      return {
        ...state,
        exEditList: action.payload,
        error: null
      };
    case TermPaymentsList:
      return {
        ...state,
        termPList: action.payload,
        error: null
      };
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

export default carReducer;
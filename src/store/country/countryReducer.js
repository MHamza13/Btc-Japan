// countryReducer.js
import { GET_LIST, SET_LOADING, GET_CURRENCIES_LIST } from './countryActions';



const initialState = {
    list: [],
    currenciesList: [],
    loading: false,
    error: null,
};
  
const countryReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_LIST:
            return {
                ...state,
                list: action.payload,
                error: null,
            };
        case GET_CURRENCIES_LIST:
            return {
                ...state,
                currenciesList: action.payload,
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
  
export default countryReducer;
// userReducer.js
import { LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, USERS_LIST, SET_LOADING } from './userActions';



const initialState = {
    isAuthenticated: false,
    user: [],
    userList: [],
    error: null,
    loading: false,
};
  
const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_SUCCESS:
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload,
                error: null,
            };
        case LOGIN_FAILURE:
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                error: action.payload,
            };
        case LOGOUT:
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                error: null,
            };
        case USERS_LIST:
            return {
                ...state,
                isAuthenticated: true,
                userList: action.payload,
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
  
export default userReducer;
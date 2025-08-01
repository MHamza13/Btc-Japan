// staffReducer.js
import { 
    StaffList, 
    SET_LOADING, 
    EditStaffList, 
    SalaryType, 
    AttendanceStatus, 
    AttendanceList, 
    SalaryList 
} from './staffActions';



const initialState = {
    stlist: [],
    stEditList: [],
    salaryTypeList: [],
    aStatusList: [],
    sAttendanceList: [],
    sSalaryList: [],
    loading: false,
    error: null,
};
  
const staffReducer = (state = initialState, action) => {
    switch (action.type) {
        case StaffList:
            return {
                ...state,
                stlist: action.payload,
                error: null,
            };
        case EditStaffList:
            return {
                ...state,
                stEditList: action.payload,
                error: null,
            };
        case SalaryType:
            return {
                ...state,
                salaryTypeList: action.payload,
                error: null,
            };
        case AttendanceStatus:
            return {
                ...state,
                aStatusList: action.payload,
                error: null,
            };
        case AttendanceList:
            return {
                ...state,
                sAttendanceList: action.payload,
                error: null,
            };
        case SalaryList:
            return {
                ...state,
                sSalaryList: action.payload,
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
  
export default staffReducer;
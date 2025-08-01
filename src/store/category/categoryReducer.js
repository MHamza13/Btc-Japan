// categoryReducer.js
import { CategoryList, EditCategory, SET_LOADING } from './categoryAction';

const initialState = {
  categoryList: [], 
  editCategory: [], 
  loading: false,
  error: null 
};

const categoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case CategoryList:
      return {
        ...state,
        categoryList: action.payload,
        error: null
      };
    case EditCategory:
      return {
        ...state,
        editCategory: action.payload,
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

export default categoryReducer;

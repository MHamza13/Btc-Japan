// src/store/station/StationReducer.js
import { StationList, EditStation, SET_LOADING } from './StationAction';

const initialState = {
  list: [],          // Holds the list of all stations
  editStation: null, // Holds data for a single station being edited
  loading: false,    // Tracks loading state
};

const stationReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, loading: action.payload };
    case StationList:
      return { ...state, list: action.payload, loading: false };
    case EditStation:
      return { ...state, editStation: action.payload, loading: false };
    default:
      return state;
  }
};

export default stationReducer;
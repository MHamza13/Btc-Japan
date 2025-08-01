const initialState = {
  pendingSaleAmount: [],
  pendingPurchaseAmount: [],
};

const reminderReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_PENDING_AMOUNTS':
      return {
        ...state,
        pendingSaleAmount: action.payload.pendingSaleAmount,
        pendingPurchaseAmount: action.payload.pendingPurchaseAmount,
      };
    default:
      return state;
  }
};

export default reminderReducer;
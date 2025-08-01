export const fetchPendingPaymentsList = (countryId) => async (dispatch) => {
  const token = encryptStorage.getItem('b68f38dbe5a2');
  const Id = countryId === undefined ? '' : countryId;
  try {
    dispatch(setLoading(true));
    const pendingPaymentsListData = await axios.get(apiURL + 'Dashboard/PendingPaymentDetails?CountryId=' + Id, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Authorization': `Bearer ${token}`,
      },
    });
    dispatch({
      type: 'SET_PENDING_AMOUNTS',
      payload: {
        pendingSaleAmount: pendingPaymentsListData.data.pendingSale || [], // Adjust based on actual response
        pendingPurchaseAmount: pendingPaymentsListData.data.pendingPurchase || [], // Adjust based on actual response
      },
    });
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setLoading(false));
    Swal.fire({
      title: 'Error!',
      text: error.message,
      icon: 'error',
    });
  }
};
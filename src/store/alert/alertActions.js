export const TRIGGER_ALERT = 'TRIGGER_ALERT';

export const triggerAlert = (alertData) => ({
  type: TRIGGER_ALERT,
  payload: alertData
});
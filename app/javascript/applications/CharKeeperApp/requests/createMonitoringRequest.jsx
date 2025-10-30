import { apiRequest, options } from '../helpers';

export const createMonitoringRequest = async (accessToken, payload) => {
  return await apiRequest({
    url: `/frontend/users/monitoring.json`,
    options: options('POST', accessToken, payload)
  });
}

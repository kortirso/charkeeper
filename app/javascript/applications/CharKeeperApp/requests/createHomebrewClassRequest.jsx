import { apiRequest, options } from '../helpers';

export const createHomebrewClassRequest = async (accessToken, provider, payload) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/specialities.json`,
    options: options('POST', accessToken, payload)
  });
}

import { apiRequest, options } from '../helpers';

export const createHomebrewRaceRequest = async (accessToken, provider, payload) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/races.json`,
    options: options('POST', accessToken, payload)
  });
}

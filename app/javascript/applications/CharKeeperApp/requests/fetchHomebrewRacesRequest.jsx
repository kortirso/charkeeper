import { apiRequest, options } from '../helpers';

export const fetchHomebrewRacesRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/races.json`,
    options: options('GET', accessToken)
  });
}

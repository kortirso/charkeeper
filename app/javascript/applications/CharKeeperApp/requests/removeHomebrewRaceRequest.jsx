import { apiRequest, options } from '../helpers';

export const removeHomebrewRaceRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/races/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

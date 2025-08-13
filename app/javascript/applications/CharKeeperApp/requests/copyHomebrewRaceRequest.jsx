import { apiRequest, options } from '../helpers';

export const copyHomebrewRaceRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/races/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}

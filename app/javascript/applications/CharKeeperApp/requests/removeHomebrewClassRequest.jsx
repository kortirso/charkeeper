import { apiRequest, options } from '../helpers';

export const removeHomebrewClassRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/specialities/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

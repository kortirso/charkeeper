import { apiRequest, options } from '../helpers';

export const removeHomebrewItemRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/items/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

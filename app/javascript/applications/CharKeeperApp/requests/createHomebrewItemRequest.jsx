import { apiRequest, options } from '../helpers';

export const createHomebrewItemRequest = async (accessToken, provider, payload) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/items.json`,
    options: options('POST', accessToken, payload)
  });
}

import { apiRequest, options } from '../helpers';

export const createItemRequest = async (accessToken, provider, payload) => {
  return await apiRequest({
    url: `/homebrews/${provider}/items.json`,
    options: options('POST', accessToken, payload)
  });
}

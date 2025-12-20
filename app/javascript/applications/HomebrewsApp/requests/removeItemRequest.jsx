import { apiRequest, options } from '../helpers';

export const removeItemRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/homebrews/${provider}/items/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

import { apiRequest, options } from '../helpers';

export const fetchItemRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/homebrews/${provider}/items/${id}.json`,
    options: options('GET', accessToken)
  });
}

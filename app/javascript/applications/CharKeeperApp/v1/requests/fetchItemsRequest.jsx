import { apiRequest, options } from '../helpers';

export const fetchItemsRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/frontend/${provider}/items.json`,
    options: options('GET', accessToken)
  });
}

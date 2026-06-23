import { apiRequest, options } from '../helpers';

export const fetchItemsRequest = async (accessToken, provider, type) => {
  return await apiRequest({
    url: `/homebrews_v2/${provider}/items.json?type=${type}`,
    options: options('GET', accessToken)
  });
}

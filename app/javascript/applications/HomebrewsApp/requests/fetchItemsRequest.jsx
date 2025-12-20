import { apiRequest, options } from '../helpers';

export const fetchItemsRequest = async (accessToken, provider, kind) => {
  return await apiRequest({
    url: `/homebrews/${provider}/items.json?kind=${kind}`,
    options: options('GET', accessToken)
  });
}

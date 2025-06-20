import { apiRequest, options } from '../helpers';

export const fetchItemsRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: encodeURI(`/frontend/${provider}/items.json`),
    options: options('GET', accessToken)
  });
}

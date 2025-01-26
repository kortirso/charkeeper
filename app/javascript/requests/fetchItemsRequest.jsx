import { apiRequest, options } from '../helpers';

export const fetchItemsRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: encodeURI(`/web_telegram/${provider}/items.json`),
    options: options('GET', accessToken)
  });
}

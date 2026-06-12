import { apiRequest, options } from '../helpers';

export const fetchBooksForItemsRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/homebrews_v2/${provider}/books/for_items.json`,
    options: options('GET', accessToken)
  });
}

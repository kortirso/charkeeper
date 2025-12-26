import { apiRequest, options } from '../helpers';

export const fetchItemsRequest = async (accessToken, provider, homebrew) => {
  let url = `/frontend/${provider}/items.json`;
  if (homebrew) url += '?homebrew=1'

  return await apiRequest({
    url: url,
    options: options('GET', accessToken)
  });
}

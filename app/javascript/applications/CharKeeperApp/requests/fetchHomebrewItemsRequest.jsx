import { apiRequest, options } from '../helpers';

export const fetchHomebrewItemsRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/items.json`,
    options: options('GET', accessToken)
  });
}

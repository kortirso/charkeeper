import { apiRequest, options } from '../helpers';

export const fetchItemInfoRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/frontend/info/items/${id}.json`,
    options: options('GET', accessToken)
  });
}

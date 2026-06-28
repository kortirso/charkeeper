import { apiRequest, options } from '../helpers';

export const fetchListRequest = async (accessToken, type) => {
  return await apiRequest({
    url: `/homebrews_v2/homebrews.json?type=${type}`,
    options: options('GET', accessToken)
  });
}

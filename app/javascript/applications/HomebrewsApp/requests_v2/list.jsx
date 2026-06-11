import { apiRequest, options } from '../helpers';

export const fetchListRequest = async (accessToken, type) => {
  return await apiRequest({
    url: `/homebrews_v2/list.json?type=${type}`,
    options: options('GET', accessToken)
  });
}

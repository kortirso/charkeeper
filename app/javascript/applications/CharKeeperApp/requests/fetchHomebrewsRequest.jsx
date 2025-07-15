import { apiRequest, options } from '../helpers';

export const fetchHomebrewsRequest = async (accessToken) => {
  return await apiRequest({
    url: `/frontend/homebrews.json`,
    options: options('GET', accessToken)
  });
}

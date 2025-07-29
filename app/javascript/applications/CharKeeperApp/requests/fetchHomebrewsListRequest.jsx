import { apiRequest, options } from '../helpers';

export const fetchHomebrewsListRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}.json`,
    options: options('GET', accessToken)
  });
}

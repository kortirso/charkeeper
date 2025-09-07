import { apiRequest, options } from '../helpers';

export const fetchHomebrewModulesRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/books.json`,
    options: options('GET', accessToken)
  });
}

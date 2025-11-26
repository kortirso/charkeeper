import { apiRequest, options } from '../helpers';

export const fetchHomebrewsList = async (accessToken, provider) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}.json`,
    options: options('GET', accessToken)
  });
}

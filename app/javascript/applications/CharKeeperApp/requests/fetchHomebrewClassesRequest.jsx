import { apiRequest, options } from '../helpers';

export const fetchHomebrewClassesRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/specialities.json`,
    options: options('GET', accessToken)
  });
}

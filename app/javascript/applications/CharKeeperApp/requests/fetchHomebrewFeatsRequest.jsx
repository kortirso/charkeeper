import { apiRequest, options } from '../helpers';

export const fetchHomebrewFeatsRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/feats.json`,
    options: options('GET', accessToken)
  });
}

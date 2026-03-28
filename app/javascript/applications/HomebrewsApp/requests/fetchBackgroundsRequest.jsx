import { apiRequest, options } from '../helpers';

export const fetchBackgroundsRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/homebrews/${provider}/backgrounds.json`,
    options: options('GET', accessToken)
  });
}

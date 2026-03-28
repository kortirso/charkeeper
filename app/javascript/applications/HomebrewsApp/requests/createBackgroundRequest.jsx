import { apiRequest, options } from '../helpers';

export const createBackgroundRequest = async (accessToken, provider, payload) => {
  return await apiRequest({
    url: `/homebrews/${provider}/backgrounds.json`,
    options: options('POST', accessToken, payload)
  });
}

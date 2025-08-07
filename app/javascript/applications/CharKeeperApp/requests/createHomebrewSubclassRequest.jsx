import { apiRequest, options } from '../helpers';

export const createHomebrewSubclassRequest = async (accessToken, provider, payload) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/subclasses.json`,
    options: options('POST', accessToken, payload)
  });
}

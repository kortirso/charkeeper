import { apiRequest, options } from '../helpers';

export const createHomebrewFeatRequest = async (accessToken, provider, payload) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/feats.json`,
    options: options('POST', accessToken, payload)
  });
}

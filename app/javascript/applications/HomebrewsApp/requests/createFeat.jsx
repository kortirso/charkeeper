import { apiRequest, options } from '../helpers';

export const createFeat = async (accessToken, provider, payload) => {
  return await apiRequest({
    url: `/homebrews/${provider}/feats.json`,
    options: options('POST', accessToken, payload)
  });
}

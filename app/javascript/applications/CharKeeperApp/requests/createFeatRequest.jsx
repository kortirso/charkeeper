import { apiRequest, options } from '../helpers';

export const createFeatRequest = async (accessToken, provider, id, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/feats.json`,
    options: options('POST', accessToken, payload)
  });
}

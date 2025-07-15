import { apiRequest, options } from '../helpers';

export const removeHomebrewFeatRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/feats/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

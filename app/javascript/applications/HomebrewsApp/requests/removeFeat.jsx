import { apiRequest, options } from '../helpers';

export const removeFeat = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/homebrews/${provider}/feats/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

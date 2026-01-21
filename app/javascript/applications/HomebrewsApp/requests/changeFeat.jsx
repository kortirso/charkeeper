import { apiRequest, options } from '../helpers';

export const changeFeat = async (accessToken, provider, id, payload) => {
  return await apiRequest({
    url: `/homebrews/${provider}/feats/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

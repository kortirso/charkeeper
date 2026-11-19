import { apiRequest, options } from '../helpers';

export const removeFeatRequest = async (accessToken, provider, characterId, id) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/feats/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

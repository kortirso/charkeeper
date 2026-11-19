import { apiRequest, options } from '../helpers';

export const changeFeatRequest = async (accessToken, provider, characterId, id, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/feats/${id}/change.json`,
    options: options('PATCH', accessToken, payload)
  });
}

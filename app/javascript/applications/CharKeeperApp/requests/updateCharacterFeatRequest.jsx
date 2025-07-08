import { apiRequest, options } from '../helpers';

export const updateCharacterFeatRequest = async (accessToken, provider, characterId, id, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/feats/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

import { apiRequest, options } from '../helpers';

export const updateCharacterItemRequest = async (accessToken, provider, characterId, id, payload, kind = 'characters') => {
  return await apiRequest({
    url: `/frontend/${provider}/${kind}/${characterId}/items/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

import { apiRequest, options } from '../helpers';

export const removeCharacterItemRequest = async (accessToken, provider, characterId, id, kind = 'characters') => {
  return await apiRequest({
    url: `/frontend/${provider}/${kind}/${characterId}/items/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

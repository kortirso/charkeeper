import { apiRequest, options } from '../helpers';

export const removeCharacterItemRequest = async (accessToken, provider, characterId, id) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/items/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

import { apiRequest, options } from '../helpers';

export const updateCharacterItemRequest = async (accessToken, provider, characterId, id, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/items/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

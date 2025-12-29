import { apiRequest, options } from '../helpers';

export const consumeCharacterItemRequest = async (accessToken, provider, characterId, itemId, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/items/${itemId}/consume.json`,
    options: options('POST', accessToken, payload)
  });
}

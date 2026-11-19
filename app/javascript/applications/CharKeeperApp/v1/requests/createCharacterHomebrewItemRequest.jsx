import { apiRequest, options } from '../helpers';

export const createCharacterHomebrewItemRequest = async (accessToken, provider, characterId, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/homebrew_items.json`,
    options: options('POST', accessToken, payload)
  });
}

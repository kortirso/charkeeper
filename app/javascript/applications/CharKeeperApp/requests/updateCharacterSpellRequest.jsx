import { apiRequest, options } from '../helpers';

export const updateCharacterSpellRequest = async (accessToken, provider, characterId, id, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/spells/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

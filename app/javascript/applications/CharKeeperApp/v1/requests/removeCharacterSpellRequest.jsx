import { apiRequest, options } from '../helpers';

export const removeCharacterSpellRequest = async (accessToken, provider, characterId, id) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/spells/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

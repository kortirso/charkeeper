import { apiRequest, options } from '../helpers';

export const clearCharacterSpellsRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/spells/clear.json`,
    options: options('POST', accessToken)
  });
}

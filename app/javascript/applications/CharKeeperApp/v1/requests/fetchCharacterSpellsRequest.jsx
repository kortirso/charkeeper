import { apiRequest, options } from '../helpers';

export const fetchCharacterSpellsRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/spells.json`,
    options: options('GET', accessToken)
  });
}

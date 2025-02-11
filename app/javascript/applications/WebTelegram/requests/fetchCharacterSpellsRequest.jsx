import { apiRequest, options } from '../../../helpers';

export const fetchCharacterSpellsRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/web_telegram/${provider}/characters/${id}/spells.json`,
    options: options('GET', accessToken)
  });
}

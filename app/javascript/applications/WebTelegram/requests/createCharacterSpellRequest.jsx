import { apiRequest, options } from '../../../helpers';

export const createCharacterSpellRequest = async (accessToken, provider, id, payload) => {
  return await apiRequest({
    url: `/web_telegram/${provider}/characters/${id}/spells.json`,
    options: options('POST', accessToken, payload)
  });
}

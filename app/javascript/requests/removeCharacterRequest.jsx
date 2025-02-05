import { apiRequest, options } from '../helpers';

export const removeCharacterRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/web_telegram/characters/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

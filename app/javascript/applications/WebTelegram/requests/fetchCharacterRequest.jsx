import { apiRequest, options } from '../../../helpers';

export const fetchCharacterRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/web_telegram/characters/${id}.json`,
    options: options('GET', accessToken)
  });
}

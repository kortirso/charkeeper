import { apiRequest, options } from '../../../helpers';

export const fetchCharactersRequest = async (accessToken) => {
  return await apiRequest({
    url: '/web_telegram/characters.json',
    options: options('GET', accessToken)
  });
}

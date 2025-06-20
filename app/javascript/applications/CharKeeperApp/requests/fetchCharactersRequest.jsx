import { apiRequest, options } from '../helpers';

export const fetchCharactersRequest = async (accessToken) => {
  return await apiRequest({
    url: '/frontend/characters.json',
    options: options('GET', accessToken)
  });
}

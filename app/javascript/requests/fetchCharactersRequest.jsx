import { apiRequest } from '../helpers';

export const fetchCharactersRequest = async (accessToken) => {
  return await apiRequest({
    url: '/web_telegram/characters.json',
    options: {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  });
}

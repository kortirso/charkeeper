import { apiRequest } from '../helpers';

export const fetchCharacterRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/web_telegram/characters/${id}.json`,
    options: {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  });
}

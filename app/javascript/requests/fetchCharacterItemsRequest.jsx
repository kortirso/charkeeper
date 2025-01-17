import { apiRequest } from '../helpers';

export const fetchCharacterItemsRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/web_telegram/characters/${id}/items.json`,
    options: {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  });
}

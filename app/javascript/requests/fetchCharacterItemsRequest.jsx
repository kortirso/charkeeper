import { apiRequest } from '../helpers';

export const fetchCharacterItemsRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/api/v1/characters/${id}/items.json`,
    options: {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  });
}

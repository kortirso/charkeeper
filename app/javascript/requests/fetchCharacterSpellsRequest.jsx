import { apiRequest } from '../helpers';

export const fetchCharacterSpellsRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/web_telegram/characters/${id}/spells.json`,
    options: {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  });
}

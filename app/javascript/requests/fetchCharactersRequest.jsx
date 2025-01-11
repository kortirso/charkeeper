import { apiRequest } from '../helpers';

export const fetchCharactersRequest = async (accessToken) => {
  return await apiRequest({
    url: '/api/v1/characters.json',
    options: {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  });
}

import { apiRequest, options } from '../helpers';

export const importCharacterRequest = async (accessToken, payload) => {
  return await apiRequest({
    url: '/frontend/characters/import.json',
    options: options('POST', accessToken, payload)
  });
}

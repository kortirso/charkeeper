import { apiRequest, options } from '../helpers';

export const importCharacterRequest = async (accessToken, provider, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/import.json`,
    options: options('POST', accessToken, payload)
  });
}

import { apiRequest, options } from '../helpers';

export const createCharacterRequest = async (accessToken, provider, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters.json`,
    options: options('POST', accessToken, payload)
  });
}

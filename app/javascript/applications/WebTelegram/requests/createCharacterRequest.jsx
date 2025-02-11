import { apiRequest, options } from '../../../helpers';

export const createCharacterRequest = async (accessToken, provider, payload) => {
  return await apiRequest({
    url: `/web_telegram/${provider}/characters.json`,
    options: options('POST', accessToken, payload)
  });
}

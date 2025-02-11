import { apiRequest, options } from '../helpers';

export const createCharacterRestRequest = async (accessToken, provider, id, payload) => {
  return await apiRequest({
    url: `/web_telegram/${provider}/characters/${id}/rest.json`,
    options: options('POST', accessToken, payload)
  });
}

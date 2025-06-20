import { apiRequest, options } from '../helpers';

export const createCharacterRestRequest = async (accessToken, provider, id, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/rest.json`,
    options: options('POST', accessToken, payload)
  });
}

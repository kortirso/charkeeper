import { apiRequest, options } from '../helpers';

export const createCharacterHealthRequest = async (accessToken, provider, id, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/health.json`,
    options: options('POST', accessToken, payload)
  });
}

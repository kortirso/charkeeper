import { apiRequest, options } from '../helpers';

export const createTalentRequest = async (accessToken, provider, id, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/talents.json`,
    options: options('POST', accessToken, payload)
  });
}

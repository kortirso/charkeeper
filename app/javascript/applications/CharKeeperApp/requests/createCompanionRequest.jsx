import { apiRequest, options } from '../helpers';

export const createCompanionRequest = async (accessToken, provider, id, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/companions.json`,
    options: options('POST', accessToken, payload)
  });
}

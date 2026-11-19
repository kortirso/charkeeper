import { apiRequest, options } from '../helpers';

export const createBotRequest = async (accessToken, payload) => {
  return await apiRequest({
    url: '/frontend/bots.json',
    options: options('POST', accessToken, payload)
  });
}

import { apiRequest, options } from '../helpers';

export const createReorderRequest = async (accessToken, payload) => {
  return await apiRequest({
    url: '/frontend/characters/reorder.json',
    options: options('POST', accessToken, payload)
  });
}

import { apiRequest, options } from '../helpers';

export const createCharacterItemRequest = async (accessToken, provider, id, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/items.json`,
    options: options('POST', accessToken, payload)
  });
}

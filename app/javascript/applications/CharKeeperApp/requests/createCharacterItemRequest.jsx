import { apiRequest, options } from '../helpers';

export const createCharacterItemRequest = async (accessToken, provider, id, payload, kind = 'characters') => {
  return await apiRequest({
    url: `/frontend/${provider}/${kind}/${id}/items.json`,
    options: options('POST', accessToken, payload)
  });
}

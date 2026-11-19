import { apiRequest, options } from '../helpers';

export const createCraftRequest = async (accessToken, provider, characterId, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/craft.json`,
    options: options('POST', accessToken, payload)
  });
}

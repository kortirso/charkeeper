import { apiRequest, options } from '../helpers';

export const createUpgradeRequest = async (accessToken, provider, characterId, itemId, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/items/${itemId}/upgrade.json`,
    options: options('POST', accessToken, payload)
  });
}

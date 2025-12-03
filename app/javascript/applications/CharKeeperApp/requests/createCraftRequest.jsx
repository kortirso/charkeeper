import { apiRequest, options } from '../helpers';

export const createCraftRequest = async (accessToken, characterId, payload) => {
  return await apiRequest({
    url: `/frontend/dnd2024/characters/${characterId}/craft.json`,
    options: options('POST', accessToken, payload)
  });
}

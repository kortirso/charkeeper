import { apiRequest, options } from '../helpers';

export const createCthulhuItemRequest = async (accessToken, characterId, payload) => {
  return await apiRequest({
    url: `/frontend/cthulhu7/characters/${characterId}/items/load.json`,
    options: options('POST', accessToken, payload)
  });
}

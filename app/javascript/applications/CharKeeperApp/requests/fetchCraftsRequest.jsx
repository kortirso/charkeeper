import { apiRequest, options } from '../helpers';

export const fetchCraftsRequest = async (accessToken, characterId) => {
  return await apiRequest({
    url: `/frontend/dnd2024/characters/${characterId}/craft.json`,
    options: options('GET', accessToken)
  });
}

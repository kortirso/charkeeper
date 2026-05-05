import { apiRequest, options } from '../helpers';

export const updateCharacterResourceRequest = async (accessToken, characterId, id, payload) => {
  return await apiRequest({
    url: `/frontend/characters/${characterId}/resources/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

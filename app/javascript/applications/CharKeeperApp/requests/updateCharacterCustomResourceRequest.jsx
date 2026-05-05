import { apiRequest, options } from '../helpers';

export const updateCharacterCustomResourceRequest = async (accessToken, characterId, id, payload) => {
  return await apiRequest({
    url: `/frontend/characters/${characterId}/custom_resources/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

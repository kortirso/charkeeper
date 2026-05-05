import { apiRequest, options } from '../helpers';

export const removeCharacterCustomResourceRequest = async (accessToken, characterId, id) => {
  return await apiRequest({
    url: `/frontend/characters/${characterId}/custom_resources/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

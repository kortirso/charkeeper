import { apiRequest, options } from '../helpers';

export const createCharacterCustomResourceRequest = async (accessToken, id, payload) => {
  return await apiRequest({
    url: `/frontend/characters/${id}/custom_resources.json`,
    options: options('POST', accessToken, payload)
  });
}

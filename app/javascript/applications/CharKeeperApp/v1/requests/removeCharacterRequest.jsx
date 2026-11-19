import { apiRequest, options } from '../helpers';

export const removeCharacterRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/frontend/characters/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

import { apiRequest, options } from '../helpers';

export const resetCharacterRequest = async (accessToken, characterId) => {
  return await apiRequest({
    url: `/frontend/characters/${characterId}/reset.json`,
    options: options('POST', accessToken)
  });
}

import { apiRequest, options } from '../helpers';

export const removeDaggerheartProjectRequest = async (accessToken, characterId, id) => {
  return await apiRequest({
    url: `/frontend/daggerheart/characters/${characterId}/projects/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

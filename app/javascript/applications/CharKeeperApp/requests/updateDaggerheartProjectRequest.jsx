import { apiRequest, options } from '../helpers';

export const updateDaggerheartProjectRequest = async (accessToken, characterId, id, payload) => {
  return await apiRequest({
    url: `/frontend/daggerheart/characters/${characterId}/projects/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

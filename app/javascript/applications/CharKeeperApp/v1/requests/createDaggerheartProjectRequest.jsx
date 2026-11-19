import { apiRequest, options } from '../helpers';

export const createDaggerheartProjectRequest = async (accessToken, id, payload) => {
  return await apiRequest({
    url: `/frontend/daggerheart/characters/${id}/projects.json`,
    options: options('POST', accessToken, payload)
  });
}

import { apiRequest, options } from '../helpers';

export const fetchDaggerheartProjectsRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/frontend/daggerheart/characters/${id}/projects.json`,
    options: options('GET', accessToken)
  });
}

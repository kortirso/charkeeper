import { apiRequest, options } from '../helpers';

export const fetchDc20CharacterAncestriesRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/frontend/dc20/characters/${id}/ancestries.json`,
    options: options('GET', accessToken)
  });
}

import { apiRequest, options } from '../helpers';

export const fetchCharacterCustomResourcesRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/frontend/characters/${id}/custom_resources.json`,
    options: options('GET', accessToken)
  });
}

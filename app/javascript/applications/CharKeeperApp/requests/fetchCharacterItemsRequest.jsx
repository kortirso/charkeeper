import { apiRequest, options } from '../helpers';

export const fetchCharacterItemsRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/items.json`,
    options: options('GET', accessToken)
  });
}

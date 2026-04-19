import { apiRequest, options } from '../helpers';

export const fetchCharacterItemsRequest = async (accessToken, provider, id, kind = 'characters') => {
  return await apiRequest({
    url: `/frontend/${provider}/${kind}/${id}/items.json`,
    options: options('GET', accessToken)
  });
}

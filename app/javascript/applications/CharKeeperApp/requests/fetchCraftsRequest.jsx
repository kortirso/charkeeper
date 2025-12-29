import { apiRequest, options } from '../helpers';

export const fetchCraftsRequest = async (accessToken, provider, characterId) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/craft.json`,
    options: options('GET', accessToken)
  });
}

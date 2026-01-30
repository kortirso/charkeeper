import { apiRequest, options } from '../helpers';

export const fetchSpellRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/${provider}/spells/${id}.json`,
    options: options('GET', accessToken)
  });
}

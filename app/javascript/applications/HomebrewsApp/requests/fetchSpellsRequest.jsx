import { apiRequest, options } from '../helpers';

export const fetchSpellsRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/frontend/${provider}/spells.json?version=0.4.5`,
    options: options('GET', accessToken)
  });
}

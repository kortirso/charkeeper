import { apiRequest, options } from '../helpers';

export const fetchHomebrewSpellsRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/homebrews/${provider}/spells.json`,
    options: options('GET', accessToken)
  });
}

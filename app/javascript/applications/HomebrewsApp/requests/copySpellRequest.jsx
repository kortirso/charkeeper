import { apiRequest, options } from '../helpers';

export const copySpellRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/homebrews/${provider}/spells/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}

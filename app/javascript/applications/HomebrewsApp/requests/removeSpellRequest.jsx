import { apiRequest, options } from '../helpers';

export const removeSpellRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/homebrews/${provider}/spells/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

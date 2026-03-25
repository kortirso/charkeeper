import { apiRequest, options } from '../helpers';

export const changeSpellRequest = async (accessToken, provider, id, payload) => {
  return await apiRequest({
    url: `/homebrews/${provider}/spells/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

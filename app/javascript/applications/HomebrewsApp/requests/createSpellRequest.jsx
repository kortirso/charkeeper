import { apiRequest, options } from '../helpers';

export const createSpellRequest = async (accessToken, provider, payload) => {
  return await apiRequest({
    url: `/homebrews/${provider}/spells.json`,
    options: options('POST', accessToken, payload)
  });
}

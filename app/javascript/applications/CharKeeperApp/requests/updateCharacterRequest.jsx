import { apiRequest, options } from '../helpers';

export const updateCharacterRequest = async (accessToken, provider, id, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

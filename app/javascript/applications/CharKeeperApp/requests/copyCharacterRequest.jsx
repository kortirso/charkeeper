import { apiRequest, options } from '../helpers';

export const copyCharacterRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}

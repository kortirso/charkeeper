import { apiRequest, options } from '../helpers';

export const createCharacterBonusRequest = async (accessToken, provider, id, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/bonuses.json`,
    options: options('POST', accessToken, payload)
  });
}

import { apiRequest, options } from '../helpers';

export const fetchCharacterBonusesRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/bonuses.json`,
    options: options('GET', accessToken)
  });
}

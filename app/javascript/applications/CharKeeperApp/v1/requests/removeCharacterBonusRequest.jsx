import { apiRequest, options } from '../helpers';

export const removeCharacterBonusRequest = async (accessToken, provider, characterId, id) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/bonuses/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

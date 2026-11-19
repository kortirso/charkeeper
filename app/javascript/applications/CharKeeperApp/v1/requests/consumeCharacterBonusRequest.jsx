import { apiRequest, options } from '../helpers';

export const consumeCharacterBonusRequest = async (accessToken, provider, characterId, bonusId, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/bonuses/${bonusId}/consume.json`,
    options: options('POST', accessToken, payload)
  });
}

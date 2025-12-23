import { apiRequest, options } from '../helpers';

export const updateCharacterBonusRequest = async (accessToken, provider, characterId, id, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/bonuses/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

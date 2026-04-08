import { apiRequest, options } from '../helpers';

export const removeTalentRequest = async (accessToken, provider, characterId, id) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/talents/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

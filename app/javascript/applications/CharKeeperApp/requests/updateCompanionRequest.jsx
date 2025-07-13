import { apiRequest, options } from '../helpers';

export const updateCompanionRequest = async (accessToken, provider, characterId, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/companions.json`,
    options: options('PATCH', accessToken, payload)
  });
}

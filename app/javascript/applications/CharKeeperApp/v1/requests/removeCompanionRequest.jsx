import { apiRequest, options } from '../helpers';

export const removeCompanionRequest = async (accessToken, provider, characterId, type='companions') => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/${type}.json`,
    options: options('DELETE', accessToken)
  });
}

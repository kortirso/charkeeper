import { apiRequest, options } from '../helpers';

export const upgradeCompanionRequest = async (accessToken, provider, id, type='companions') => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/${type}/upgrade.json`,
    options: options('POST', accessToken)
  });
}

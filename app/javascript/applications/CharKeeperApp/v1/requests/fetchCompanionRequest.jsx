import { apiRequest, options } from '../helpers';

export const fetchCompanionRequest = async (accessToken, provider, id, type='companions') => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/${type}.json`,
    options: options('GET', accessToken)
  });
}

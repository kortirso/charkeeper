import { apiRequest, options } from '../helpers';

export const createCompanionRequest = async (accessToken, provider, id, payload, type='companions') => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/${type}.json`,
    options: options('POST', accessToken, payload)
  });
}

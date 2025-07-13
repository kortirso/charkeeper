import { apiRequest, options } from '../helpers';

export const fetchCompanionRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/companions.json`,
    options: options('GET', accessToken)
  });
}

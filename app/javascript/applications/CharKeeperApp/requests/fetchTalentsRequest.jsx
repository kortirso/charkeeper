import { apiRequest, options } from '../helpers';

export const fetchTalentsRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/talents.json`,
    options: options('GET', accessToken)
  });
}

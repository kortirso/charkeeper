import { apiRequest, options } from '../helpers';

export const removeHomebrewDomainRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/domains/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

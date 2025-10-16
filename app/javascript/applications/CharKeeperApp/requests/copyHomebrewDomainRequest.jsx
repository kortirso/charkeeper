import { apiRequest, options } from '../helpers';

export const copyHomebrewDomainRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/domains/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}

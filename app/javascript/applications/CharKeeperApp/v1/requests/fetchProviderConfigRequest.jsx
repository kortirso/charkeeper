import { apiRequest, options } from '../helpers';

export const fetchProviderConfigRequest = async (accessToken, provider, key) => {
  return await apiRequest({
    url: `/frontend/${provider}/config/${key}.json`,
    options: options('GET', accessToken)
  });
}

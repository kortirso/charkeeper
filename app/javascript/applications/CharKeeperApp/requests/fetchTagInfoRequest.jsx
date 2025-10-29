import { apiRequest, options } from '../helpers';

export const fetchTagInfoRequest = async (accessToken, provider, type, tag) => {
  return await apiRequest({
    url: `/frontend/${provider}/tags/${type}/${tag}.json`,
    options: options('GET', accessToken)
  });
}

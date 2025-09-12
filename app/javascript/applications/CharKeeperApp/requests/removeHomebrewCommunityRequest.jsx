import { apiRequest, options } from '../helpers';

export const removeHomebrewCommunityRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/communities/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

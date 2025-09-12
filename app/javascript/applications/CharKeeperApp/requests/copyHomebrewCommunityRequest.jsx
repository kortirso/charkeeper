import { apiRequest, options } from '../helpers';

export const copyHomebrewCommunityRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/communities/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}

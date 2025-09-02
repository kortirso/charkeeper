import { apiRequest, options } from '../helpers';

export const copyHomebrewItemRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/items/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}

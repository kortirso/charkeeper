import { apiRequest, options } from '../helpers';

export const copyItemRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/homebrews/${provider}/items/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}

import { apiRequest, options } from '../helpers';

export const changeItemRequest = async (accessToken, provider, id, payload) => {
  return await apiRequest({
    url: `/homebrews/${provider}/items/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

import { apiRequest, options } from '../helpers';

export const changeBookContent = async (accessToken, provider, id, payload, type) => {
  return await apiRequest({
    url: `/homebrews/${provider}/books/${id}/content.json?type=${type}`,
    options: options('POST', accessToken, payload)
  });
}

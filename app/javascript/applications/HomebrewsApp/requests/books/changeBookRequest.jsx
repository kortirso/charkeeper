import { apiRequest, options } from '../../helpers';

export const changeBookRequest = async (accessToken, provider, id, payload) => {
  return await apiRequest({
    url: `/homebrews/${provider}/books/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

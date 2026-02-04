import { apiRequest, options } from '../../helpers';

export const removeBookRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/homebrews/${provider}/books/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

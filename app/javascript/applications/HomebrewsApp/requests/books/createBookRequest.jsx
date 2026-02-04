import { apiRequest, options } from '../../helpers';

export const createBookRequest = async (accessToken, provider, payload) => {
  return await apiRequest({
    url: `/homebrews/${provider}/books.json`,
    options: options('POST', accessToken, payload)
  });
}

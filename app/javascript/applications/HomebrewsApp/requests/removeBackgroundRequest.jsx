import { apiRequest, options } from '../helpers';

export const removeBackgroundRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/homebrews/${provider}/backgrounds/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

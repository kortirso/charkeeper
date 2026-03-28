import { apiRequest, options } from '../helpers';

export const copyBackgroundRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/homebrews/${provider}/backgrounds/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}

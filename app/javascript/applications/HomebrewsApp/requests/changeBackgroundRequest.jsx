import { apiRequest, options } from '../helpers';

export const changeBackgroundRequest = async (accessToken, provider, id, payload) => {
  return await apiRequest({
    url: `/homebrews/${provider}/backgrounds/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

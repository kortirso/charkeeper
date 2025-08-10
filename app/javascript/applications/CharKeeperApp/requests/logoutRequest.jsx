import { apiRequest, options } from '../helpers';

export const logoutRequest = async (accessToken) => {
  return await apiRequest({
    url: `/frontend/signin.json`,
    options: options('DELETE', accessToken)
  });
}

import { apiRequest, options } from '../helpers';

export const fetchUserInfoRequest = async (accessToken) => {
  return await apiRequest({
    url: '/frontend/users/info.json',
    options: options('GET', accessToken)
  });
}

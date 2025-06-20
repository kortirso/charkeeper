import { apiRequest, options } from '../helpers';

export const updateUserRequest = async (accessToken, payload) => {
  return await apiRequest({
    url: `/frontend/users.json`,
    options: options('PATCH', accessToken, { user: payload })
  });
}

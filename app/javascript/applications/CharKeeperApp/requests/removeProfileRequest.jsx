import { apiRequest, options } from '../helpers';

export const removeProfileRequest = async (accessToken) => {
  return await apiRequest({
    url: `/frontend/users.json`,
    options: options('DELETE', accessToken)
  });
}

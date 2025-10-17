import { apiRequest, options } from '../helpers';

export const removeIdentityRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/frontend/users/identities/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

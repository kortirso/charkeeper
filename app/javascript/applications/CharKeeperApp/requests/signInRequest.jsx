import { apiRequest, options } from '../helpers';

export const signInRequest = async (payload) => {
  return await apiRequest({
    url: `/frontend/signin`,
    options: options('POST', null, payload)
  });
}

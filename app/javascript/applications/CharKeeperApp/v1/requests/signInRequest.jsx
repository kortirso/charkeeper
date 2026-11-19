import { apiRequest, options } from '../helpers';

export const signInRequest = async (payload) => {
  return await apiRequest({
    url: '/frontend/signin.json',
    options: options('POST', null, payload)
  });
}

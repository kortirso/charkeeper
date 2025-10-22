import { apiRequest, options } from '../helpers';

export const signUpRequest = async (payload) => {
  return await apiRequest({
    url: '/frontend/signup.json',
    options: options('POST', null, payload)
  });
}

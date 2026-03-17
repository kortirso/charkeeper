import { apiRequest, options } from '../helpers';

export const createSubclassRequest = async (accessToken, provider, payload) => {
  return await apiRequest({
    url: `/homebrews/${provider}/subclasses.json`,
    options: options('POST', accessToken, payload)
  });
}

import { apiRequest, options } from '../helpers';

export const fetchSubclassesRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/homebrews/${provider}/subclasses.json`,
    options: options('GET', accessToken)
  });
}

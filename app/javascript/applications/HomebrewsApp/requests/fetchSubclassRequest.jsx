import { apiRequest, options } from '../helpers';

export const fetchSubclassRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/homebrews/${provider}/subclasses/${id}.json`,
    options: options('GET', accessToken)
  });
}

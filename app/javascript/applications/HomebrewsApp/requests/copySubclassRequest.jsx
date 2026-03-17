import { apiRequest, options } from '../helpers';

export const copySubclassRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/homebrews/${provider}/subclasses/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}

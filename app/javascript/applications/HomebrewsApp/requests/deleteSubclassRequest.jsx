import { apiRequest, options } from '../helpers';

export const deleteSubclassRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/homebrews/${provider}/subclasses/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

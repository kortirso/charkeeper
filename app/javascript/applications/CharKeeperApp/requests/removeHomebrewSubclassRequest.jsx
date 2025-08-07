import { apiRequest, options } from '../helpers';

export const removeHomebrewSubclassRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/subclasses/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

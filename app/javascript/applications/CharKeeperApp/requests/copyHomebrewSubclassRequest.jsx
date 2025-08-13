import { apiRequest, options } from '../helpers';

export const copyHomebrewSubclassRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/subclasses/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}

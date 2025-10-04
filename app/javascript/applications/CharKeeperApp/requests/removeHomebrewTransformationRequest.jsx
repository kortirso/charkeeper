import { apiRequest, options } from '../helpers';

export const removeHomebrewTransformationRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/transformations/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

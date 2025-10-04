import { apiRequest, options } from '../helpers';

export const copyHomebrewTransformationRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/homebrews/${provider}/transformations/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}

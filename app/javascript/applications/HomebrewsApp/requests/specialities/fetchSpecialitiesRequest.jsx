import { apiRequest, options } from '../../helpers';

export const fetchSpecialitiesRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/homebrews/${provider}/specialities.json`,
    options: options('GET', accessToken)
  });
}

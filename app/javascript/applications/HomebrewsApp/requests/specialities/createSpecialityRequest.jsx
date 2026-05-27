import { apiRequest, options } from '../../helpers';

export const createSpecialityRequest = async (accessToken, provider, payload) => {
  return await apiRequest({
    url: `/homebrews/${provider}/specialities.json`,
    options: options('POST', accessToken, payload)
  });
}

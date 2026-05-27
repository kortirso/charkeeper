import { apiRequest, options } from '../../helpers';

export const fetchSpecialityRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/homebrews/${provider}/specialities/${id}.json`,
    options: options('GET', accessToken)
  });
}

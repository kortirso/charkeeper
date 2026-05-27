import { apiRequest, options } from '../../helpers';

export const removeSpecialityRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/homebrews/${provider}/specialities/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

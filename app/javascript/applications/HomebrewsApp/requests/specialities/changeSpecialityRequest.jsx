import { apiRequest, options } from '../../helpers';

export const changeSpecialityRequest = async (accessToken, provider, id, payload) => {
  return await apiRequest({
    url: `/homebrews/${provider}/specialities/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

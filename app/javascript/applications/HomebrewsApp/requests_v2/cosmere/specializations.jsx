import { apiRequest, options } from '../../helpers';

export const fetchSpecializationRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/cosmere/specializations/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removeSpecializationRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/cosmere/specializations/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

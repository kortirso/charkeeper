import { apiRequest, options } from '../../helpers';

export const fetchSpecialityRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/dnd2024/specialities/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removeSpecialityRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/dnd2024/specialities/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

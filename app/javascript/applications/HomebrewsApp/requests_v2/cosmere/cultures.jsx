import { apiRequest, options } from '../../helpers';

export const fetchCultureRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/cosmere/cultures/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removeCultureRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/cosmere/cultures/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

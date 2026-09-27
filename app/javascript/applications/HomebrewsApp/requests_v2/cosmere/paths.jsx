import { apiRequest, options } from '../../helpers';

export const fetchPathRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/cosmere/paths/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removePathRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/cosmere/paths/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

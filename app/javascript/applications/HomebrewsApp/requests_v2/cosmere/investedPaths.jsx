import { apiRequest, options } from '../../helpers';

export const fetchInvestedPathRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/cosmere/invested_paths/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removeInvestedPathRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/cosmere/invested_paths/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

import { apiRequest, options } from '../../helpers';

export const fetchRaceRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/dnd2024/races/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removeRaceRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/dnd2024/races/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

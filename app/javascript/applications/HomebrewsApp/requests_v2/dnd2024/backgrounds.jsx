import { apiRequest, options } from '../../helpers';

export const fetchBackgroundRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/dnd2024/backgrounds/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removeBackgroundRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/dnd2024/backgrounds/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

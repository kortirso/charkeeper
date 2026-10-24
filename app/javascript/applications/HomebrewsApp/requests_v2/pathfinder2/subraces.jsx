import { apiRequest, options } from '../../helpers';

export const fetchSubraceRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/pathfinder2/subraces/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removeSubraceRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/pathfinder2/subraces/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

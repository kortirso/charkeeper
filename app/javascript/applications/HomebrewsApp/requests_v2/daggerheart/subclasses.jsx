import { apiRequest, options } from '../../helpers';

export const fetchSubclassRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/subclasses/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removeSubclassRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/subclasses/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

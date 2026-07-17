import { apiRequest, options } from '../../helpers';

export const fetchMechanicRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/mechanics/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removeMechanicRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/mechanics/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

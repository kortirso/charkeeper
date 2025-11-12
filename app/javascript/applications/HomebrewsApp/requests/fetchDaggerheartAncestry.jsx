import { apiRequest, options } from '../helpers';

export const fetchDaggerheartAncestry = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/ancestries/${id}.json`,
    options: options('GET', accessToken)
  });
}

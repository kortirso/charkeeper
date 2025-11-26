import { apiRequest, options } from '../helpers';

export const fetchDaggerheartSubclass = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/subclasses/${id}.json`,
    options: options('GET', accessToken)
  });
}

import { apiRequest, options } from '../helpers';

export const fetchDaggerheartTransformation = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/transformations/${id}.json`,
    options: options('GET', accessToken)
  });
}

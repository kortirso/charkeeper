import { apiRequest, options } from '../helpers';

export const fetchDaggerheartTransformations = async (accessToken) => {
  return await apiRequest({
    url: '/homebrews/daggerheart/transformations.json',
    options: options('GET', accessToken)
  });
}

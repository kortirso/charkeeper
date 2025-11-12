import { apiRequest, options } from '../helpers';

export const fetchDaggerheartAncestries = async (accessToken) => {
  return await apiRequest({
    url: '/homebrews/daggerheart/ancestries.json',
    options: options('GET', accessToken)
  });
}

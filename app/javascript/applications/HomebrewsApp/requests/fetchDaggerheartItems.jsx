import { apiRequest, options } from '../helpers';

export const fetchDaggerheartItems = async (accessToken, kind) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/items.json?kind=${kind}`,
    options: options('GET', accessToken)
  });
}

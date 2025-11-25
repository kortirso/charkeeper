import { apiRequest, options } from '../helpers';

export const createDaggerheartItem = async (accessToken, payload) => {
  return await apiRequest({
    url: '/homebrews/daggerheart/items.json',
    options: options('POST', accessToken, payload)
  });
}

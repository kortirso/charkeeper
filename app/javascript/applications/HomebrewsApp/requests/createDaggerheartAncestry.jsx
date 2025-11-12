import { apiRequest, options } from '../helpers';

export const createDaggerheartAncestry = async (accessToken, payload) => {
  return await apiRequest({
    url: '/homebrews/daggerheart/ancestries.json',
    options: options('POST', accessToken, payload)
  });
}

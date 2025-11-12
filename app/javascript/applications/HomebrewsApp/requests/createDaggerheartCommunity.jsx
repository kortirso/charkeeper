import { apiRequest, options } from '../helpers';

export const createDaggerheartCommunity = async (accessToken, payload) => {
  return await apiRequest({
    url: '/homebrews/daggerheart/communities.json',
    options: options('POST', accessToken, payload)
  });
}

import { apiRequest, options } from '../helpers';

export const createDaggerheartDomain = async (accessToken, payload) => {
  return await apiRequest({
    url: '/homebrews/daggerheart/domains.json',
    options: options('POST', accessToken, payload)
  });
}

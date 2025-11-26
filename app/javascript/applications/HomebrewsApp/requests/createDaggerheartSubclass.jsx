import { apiRequest, options } from '../helpers';

export const createDaggerheartSubclass = async (accessToken, payload) => {
  return await apiRequest({
    url: '/homebrews/daggerheart/subclasses.json',
    options: options('POST', accessToken, payload)
  });
}

import { apiRequest, options } from '../helpers';

export const createDaggerheartTransformation = async (accessToken, payload) => {
  return await apiRequest({
    url: '/homebrews/daggerheart/transformations.json',
    options: options('POST', accessToken, payload)
  });
}

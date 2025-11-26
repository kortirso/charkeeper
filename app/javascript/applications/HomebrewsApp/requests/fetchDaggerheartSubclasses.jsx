import { apiRequest, options } from '../helpers';

export const fetchDaggerheartSubclasses = async (accessToken) => {
  return await apiRequest({
    url: '/homebrews/daggerheart/subclasses.json',
    options: options('GET', accessToken)
  });
}

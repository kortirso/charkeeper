import { apiRequest, options } from '../helpers';

export const fetchDaggerheartFeatures = async (accessToken) => {
  return await apiRequest({
    url: '/homebrews/daggerheart/feats.json',
    options: options('GET', accessToken)
  });
}

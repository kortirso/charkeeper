import { apiRequest, options } from '../helpers';

export const fetchDaggerheartCommunities = async (accessToken) => {
  return await apiRequest({
    url: '/homebrews/daggerheart/communities.json',
    options: options('GET', accessToken)
  });
}

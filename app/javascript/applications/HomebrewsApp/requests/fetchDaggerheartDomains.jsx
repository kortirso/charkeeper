import { apiRequest, options } from '../helpers';

export const fetchDaggerheartDomains = async (accessToken) => {
  return await apiRequest({
    url: '/homebrews/daggerheart/domains.json',
    options: options('GET', accessToken)
  });
}

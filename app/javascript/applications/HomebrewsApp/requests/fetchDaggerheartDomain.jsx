import { apiRequest, options } from '../helpers';

export const fetchDaggerheartDomain = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/domains/${id}.json`,
    options: options('GET', accessToken)
  });
}

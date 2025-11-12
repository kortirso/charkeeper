import { apiRequest, options } from '../helpers';

export const fetchDaggerheartCommunity = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/communities/${id}.json`,
    options: options('GET', accessToken)
  });
}

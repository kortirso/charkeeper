import { apiRequest, options } from '../helpers';

export const removeDaggerheartCommunity = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/communities/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

import { apiRequest, options } from '../helpers';

export const copyDaggerheartCommunity = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/communities/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}

import { apiRequest, options } from '../helpers';

export const removeDaggerheartDomain = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/domains/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

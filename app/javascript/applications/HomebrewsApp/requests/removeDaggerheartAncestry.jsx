import { apiRequest, options } from '../helpers';

export const removeDaggerheartAncestry = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/ancestries/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

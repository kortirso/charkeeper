import { apiRequest, options } from '../helpers';

export const copyDaggerheartAncestry = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/ancestries/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}

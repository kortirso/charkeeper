import { apiRequest, options } from '../helpers';

export const changeDaggerheartAncestry = async (accessToken, id, payload) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/ancestries/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

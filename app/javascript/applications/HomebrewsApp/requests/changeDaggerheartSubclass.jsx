import { apiRequest, options } from '../helpers';

export const changeDaggerheartSubclass = async (accessToken, id, payload) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/subclasses/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

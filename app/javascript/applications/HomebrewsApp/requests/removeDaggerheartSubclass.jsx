import { apiRequest, options } from '../helpers';

export const removeDaggerheartSubclass = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/subclasses/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

import { apiRequest, options } from '../helpers';

export const copyDaggerheartSubclass = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/subclasses/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}

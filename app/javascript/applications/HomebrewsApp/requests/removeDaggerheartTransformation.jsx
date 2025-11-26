import { apiRequest, options } from '../helpers';

export const removeDaggerheartTransformation = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/transformations/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

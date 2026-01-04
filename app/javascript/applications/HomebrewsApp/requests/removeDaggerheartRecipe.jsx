import { apiRequest, options } from '../helpers';

export const removeDaggerheartRecipe = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/recipes/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

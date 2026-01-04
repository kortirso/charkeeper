import { apiRequest, options } from '../helpers';

export const copyDaggerheartRecipe = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/recipes/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}

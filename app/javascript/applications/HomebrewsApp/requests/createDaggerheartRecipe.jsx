import { apiRequest, options } from '../helpers';

export const createDaggerheartRecipe = async (accessToken, payload) => {
  return await apiRequest({
    url: '/homebrews/daggerheart/recipes.json',
    options: options('POST', accessToken, payload)
  });
}

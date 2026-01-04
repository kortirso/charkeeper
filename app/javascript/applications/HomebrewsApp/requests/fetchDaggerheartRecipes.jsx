import { apiRequest, options } from '../helpers';

export const fetchDaggerheartRecipes = async (accessToken) => {
  return await apiRequest({
    url: '/homebrews/daggerheart/recipes.json',
    options: options('GET', accessToken)
  });
}

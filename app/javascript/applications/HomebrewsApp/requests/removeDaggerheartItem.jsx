import { apiRequest, options } from '../helpers';

export const removeDaggerheartItem = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/items/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

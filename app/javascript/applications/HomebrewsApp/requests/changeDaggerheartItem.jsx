import { apiRequest, options } from '../helpers';

export const changeDaggerheartItem = async (accessToken, id, payload) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/items/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}
